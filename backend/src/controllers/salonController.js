const Joi = require('joi');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../middleware/upload');

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createSalonSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  location: Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
  }).optional(),
  openingHours: Joi.object().optional(),
});

const updateSalonSchema = createSalonSchema.fork(
  ['name', 'address', 'city'],
  (field) => field.optional()
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a MongoDB filter query from request query params.
 */
const buildSearchFilter = (query) => {
  const filter = { isApproved: true };

  if (query.city) filter.city = query.city.toLowerCase();
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.minRating) filter.avgRating = { $gte: parseFloat(query.minRating) };

  return filter;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/salons
 * Public — search & filter salons
 */
const getSalons = async (req, res, next) => {
  try {
    const filter = buildSearchFilter(req.query);

    // Category filter: join with services
    let salonIds = null;
    if (req.query.category) {
      const services = await Service.find({ category: req.query.category }).distinct('salonId');
      salonIds = services;
      filter._id = { $in: salonIds };
    }

    // Price filter: get salons with at least one service in range
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = { salonId: { $exists: true } };
      if (req.query.minPrice) priceFilter.price = { $gte: parseFloat(req.query.minPrice) };
      if (req.query.maxPrice) {
        priceFilter.price = { ...priceFilter.price, $lte: parseFloat(req.query.maxPrice) };
      }
      const priceSalonIds = await Service.find(priceFilter).distinct('salonId');
      if (filter._id) {
        filter._id = { $in: salonIds.filter((id) => priceSalonIds.some((pid) => pid.toString() === id.toString())) };
      } else {
        filter._id = { $in: priceSalonIds };
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const sortMap = {
      rating: { avgRating: -1 },
      reviews: { totalReviews: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[req.query.sort] || { avgRating: -1 };

    const [salons, total] = await Promise.all([
      Salon.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
      Salon.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: salons,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/salons/:id
 * Public — single salon with services + staff count
 */
const getSalonById = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id).populate('ownerId', 'name email');
    if (!salon) return next(new AppError('Salon not found.', 404));

    // Fetch services and staff count
    const [services, staffCount] = await Promise.all([
      Service.find({ salonId: salon._id, isActive: true }).select('-__v'),
      require('../models/Staff').countDocuments({ salonId: salon._id, isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: { ...salon.toJSON(), services, staffCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/salons
 * Owner only — create salon
 */
const createSalon = async (req, res, next) => {
  try {
    // One salon per owner in v1
    const existing = await Salon.findOne({ ownerId: req.user._id });
    if (existing) {
      return next(new AppError('You already have a salon. Edit it instead of creating a new one.', 409));
    }

    const { error, value } = createSalonSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const salon = await Salon.create({ ...value, ownerId: req.user._id });

    res.status(201).json({ success: true, data: salon });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/salons/:id
 * Owner only — update their salon
 */
const updateSalon = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return next(new AppError('Salon not found.', 404));
    if (salon.ownerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own salon.', 403));
    }

    const { error, value } = updateSalonSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const updated = await Salon.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/salons/:id/images
 * Owner only — upload images via Cloudinary (handled by multer middleware before this)
 */
const uploadSalonImages = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return next(new AppError('Salon not found.', 404));
    if (salon.ownerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own salon.', 403));
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one image.', 400));
    }

    const urls = req.files.map((f) => f.path); // Cloudinary returns URL as f.path
    salon.images = [...salon.images, ...urls].slice(0, 10); // cap at 10 images
    await salon.save();

    res.status(200).json({ success: true, data: salon });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/salons/:id/images
 * Owner only — remove a single image by URL
 */
const deleteSalonImage = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return next(new AppError('Salon not found.', 404));
    if (salon.ownerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own salon.', 403));
    }

    const { imageUrl } = req.body;
    if (!imageUrl) return next(new AppError('imageUrl is required.', 400));

    // Extract Cloudinary public_id and delete from cloud
    const publicId = imageUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId).catch(() => {}); // best-effort

    salon.images = salon.images.filter((img) => img !== imageUrl);
    await salon.save();

    res.status(200).json({ success: true, data: salon });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/owner/my-salon
 * Owner — get their own salon
 */
const getMySalon = async (req, res, next) => {
  try {
    const salon = await Salon.findOne({ ownerId: req.user._id });
    res.status(200).json({ success: true, data: salon || null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  uploadSalonImages,
  deleteSalonImage,
  getMySalon,
};
