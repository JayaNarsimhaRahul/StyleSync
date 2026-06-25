const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/AppError');

// ─── Cloudinary Config ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Salon Image Storage ─────────────────────────────────────────────────────
const salonStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stylesync/salons',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Staff Photo Storage ─────────────────────────────────────────────────────
const staffStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stylesync/staff',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// ─── File Filter ─────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed.', 400), false);
  }
};

// ─── Multer Instances ─────────────────────────────────────────────────────────
const uploadSalonImages = multer({
  storage: salonStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // max 5MB per file, 6 files
}).array('images', 6);

const uploadStaffPhoto = multer({
  storage: staffStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // max 2MB
}).single('photo');

// ─── Middleware Wrappers (promise-based) ─────────────────────────────────────
const handleSalonUpload = (req, res, next) => {
  uploadSalonImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('Image must be under 5MB.', 400));
      if (err.code === 'LIMIT_FILE_COUNT') return next(new AppError('Maximum 6 images allowed.', 400));
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};

const handleStaffUpload = (req, res, next) => {
  uploadStaffPhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('Photo must be under 2MB.', 400));
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = { handleSalonUpload, handleStaffUpload, cloudinary };
