const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `log-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.txt', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || file.mimetype === 'text/plain' || file.mimetype === 'text/csv' || file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, TXT, and JSON files are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: fileFilter
});

module.exports = upload;
