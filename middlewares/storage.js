const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan Multer
const storageUploadVoucher = (req, file, cb) => {
    const voucherPath = path.join(__dirname, "../public")
    cb(null, voucherPath)
  }
  
  const uploadVoucher = multer({
    limits : {
      fileSize : 10000000
    },
    storage : multer.diskStorage({
      destination : storageUploadVoucher,
      filename : (req, file, cb) => {
        cb(null, 'voucher-'+ Date.now()+ path.extname(file.originalname))
      }
    })
  })

  module.exports = uploadVoucher