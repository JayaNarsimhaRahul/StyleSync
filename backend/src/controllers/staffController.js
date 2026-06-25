const Joi = require('joi');
const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');

// ─── Validation ───────────────────────────────────────────────────────────────

const workingHoursSchema = Joi.array().items(
  Joi.object({
    day: Joi.string()
      .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      .required(),
    start: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    end: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    isOff: Joi.boolean().optional(),
  })
);

const staffSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  specialties: Joi.array().items(Joi.string().trim()).optional(),
  workingHours: workingHoursSchema.optional(),
  isActive: Joi.boolean().optional(),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

const verifySalonOwner = async (salonId, userId) => {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new AppError('Salon not found.', 404);
  if (salon.ownerId.toString() !== userId.toString()) {
    throw new AppError('You can only manage staff for your own salon.', 403);
  }
  return salon;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/salons/:id/staff
 * Public
 */
const getStaffBySalon = async (req, res, next) => {
  try {
    const staff = await Staff.find({ salonId: req.params.id, isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/salons/:id/staff
 * Owner only
 */
const createStaff = async (req, res, next) => {
  try {
    await verifySalonOwner(req.params.id, req.user._id);

    const { error, value } = staffSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    // Photo URL from Cloudinary (if file was uploaded via middleware)
    if (req.file) value.photo = req.file.path;

    const staff = await Staff.create({ ...value, salonId: req.params.id });
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/staff/:id
 * Owner only
 */
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return next(new AppError('Staff member not found.', 404));

    await verifySalonOwner(staff.salonId, req.user._id);

    const updateSchema = staffSchema.fork(['name'], (field) => field.optional());
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join(', ');
      return next(new AppError(msg, 400));
    }

    if (req.file) value.photo = req.file.path;

    const updated = await Staff.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/staff/:id
 * Owner only — soft-delete
 */
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return next(new AppError('Staff member not found.', 404));

    await verifySalonOwner(staff.salonId, req.user._id);

    staff.isActive = false;
    await staff.save();

    res.status(200).json({ success: true, message: 'Staff member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStaffBySalon, createStaff, updateStaff, deleteStaff };
