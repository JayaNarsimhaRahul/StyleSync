const mongoose = require('mongoose');

const dayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const salonSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salon must have an owner'],
    },
    name: {
      type: String,
      required: [true, 'Salon name is required'],
      trim: true,
      maxlength: [100, 'Salon name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      lowercase: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [{ type: String }],
    openingHours: {
      monday: { type: dayHoursSchema, default: () => ({}) },
      tuesday: { type: dayHoursSchema, default: () => ({}) },
      wednesday: { type: dayHoursSchema, default: () => ({}) },
      thursday: { type: dayHoursSchema, default: () => ({}) },
      friday: { type: dayHoursSchema, default: () => ({}) },
      saturday: { type: dayHoursSchema, default: () => ({}) },
      sunday: { type: dayHoursSchema, default: () => ({ isClosed: true }) },
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve in v1; Phase 3 adds superadmin gating
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for geospatial and city-based search
salonSchema.index({ city: 1 });
salonSchema.index({ avgRating: -1 });

module.exports = mongoose.model('Salon', salonSchema);
