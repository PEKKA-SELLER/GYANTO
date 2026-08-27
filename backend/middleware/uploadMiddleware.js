const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'helpdost/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
  },
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'helpdost/pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const uploadProductFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(null, true);
      return cb(new Error('Cover must be JPG/PNG/WEBP'), false);
    }
    if (file.fieldname === 'pdfFile') {
      if (file.mimetype === 'application/pdf') return cb(null, true);
      return cb(new Error('pdfFile must be a PDF'), false);
    }
    cb(new Error('Unexpected field'), false);
  },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

module.exports = { uploadProductFiles, uploadToCloudinary };
