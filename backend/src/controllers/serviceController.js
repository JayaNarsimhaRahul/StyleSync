const Joi = require('joi');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');

// ─── Validation ───────────────────────────────────────────────────────────────

const serviceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string()
    .valid('haircut', 'coloring', 'styling', 'treatment', 'beard', 'facial', 'nails', 'massage', 'other')
    .required(),
  durationMinutes: Joi.number().integer().min(5).max(480).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().trim().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

// ─── Helper — verify salon ownership ─────────────────────────────────────────

const verifySalonOwner = async (salonId, userId) => {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new AppError('Salon not found.', 404);
  if (salon.ownerId.toString() !== userId.toString()) {
    throw new AppError('You can only manage services for your own salon.', 403);
  }
  return salon;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/salons/:id/services
 * Public
 */
const getServicesBySalon = async (req, res, next) => {
  try {
    const services = await Service.find({
      salonId: req.params.id,
      isActive: true,
    }).sort({ category: 1, name: 1 });

    res.status(200).json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/salons/:id/services
 * Owner only
 */
const createService = async (req, res, next) => {
  try {
    await verifySalonOwner(req.params.id, req.user._id);

    const { error, value } = serviceSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const service = await Service.create({ ...value, salonId: req.params.id });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/services/:id
 * Owner only
 */
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found.', 404));

    await verifySalonOwner(service.salonId, req.user._id);

    const updateSchema = serviceSchema.fork(
      ['name', 'category', 'durationMinutes', 'price'],
      (field) => field.optional()
    );
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/services/:id
 * Owner only — soft-delete by setting isActive: false
 */
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found.', 404));

    await verifySalonOwner(service.salonId, req.user._id);

    service.isActive = false;
    await service.save();

    res.status(200).json({ success: true, message: 'Service deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getServicesBySalon, createService, updateService, deleteService };
