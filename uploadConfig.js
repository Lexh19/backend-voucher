// uploadConfig.js
const multer = require('multer');
const path = require('path');

const storageVouchers = (req, file, cb) => {
  const voucherPath = path.join(__dirname, '../../public/img/vouchers');
  cb(null, voucherPath);
};

const uploadPhotoVouchers = multer({
  limits: {
    fileSize: 15000000
  },
  storage: multer.diskStorage({
    destination: storageVouchers,
    filename: (req, file, cb) => {
      cb(null, 'vouchers-photo-' + Date.now() + path.extname(file.originalname));
    }
  })
});

module.exports = {
  uploadPhotoVouchers
};
