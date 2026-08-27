const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dirs exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(__dirname, '../uploads/covers'));
ensureDir(path.join(__dirname, '../uploads/pdfs'));

// Cover image storage
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/covers'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `cover-${unique}${path.extname(file.originalname)}`);
  },
});

// PDF storage
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pdfs'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `pdf-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (allowedMime) => (req, file, cb) => {
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

// Upload cover image (jpg/png/webp)
const uploadCover = multer({
  storage: coverStorage,
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Upload PDF
const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: fileFilter(['application/pdf']),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// Combined: cover + pdf in one multipart upload
const uploadProductFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'coverImage') {
        cb(null, path.join(__dirname, '../uploads/covers'));
      } else {
        cb(null, path.join(__dirname, '../uploads/pdfs'));
      }
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const prefix = file.fieldname === 'coverImage' ? 'cover' : 'pdf';
      cb(null, `${prefix}-${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Cover must be an image (JPG/PNG/WEBP)'), false);
      }
    } else if (file.fieldname === 'pdfFile') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('pdfFile must be a PDF'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

module.exports = { uploadCover, uploadPdf, uploadProductFiles };
