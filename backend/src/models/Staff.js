const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    isOff: { type: Boolean, default: false },
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: [true, 'Staff must belong to a salon'],
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    photo: {
      type: String,
      default: '',
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    workingHours: {
      type: [workingHoursSchema],
      default: [
        { day: 'monday', start: '09:00', end: '18:00' },
        { day: 'tuesday', start: '09:00', end: '18:00' },
        { day: 'wednesday', start: '09:00', end: '18:00' },
        { day: 'thursday', start: '09:00', end: '18:00' },
        { day: 'friday', start: '09:00', end: '18:00' },
        { day: 'saturday', start: '10:00', end: '16:00' },
        { day: 'sunday', start: '00:00', end: '00:00', isOff: true },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

staffSchema.index({ salonId: 1 });

module.exports = mongoose.model('Staff', staffSchema);
