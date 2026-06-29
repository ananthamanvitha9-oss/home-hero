const path = require('path');
const fs = require('fs');
const AppError = require('../core/errors/AppError');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.uploadSuccess = (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a file to upload.', 400));
    }

    // Return URL and path for client access
    const filePath = `/uploads/${req.file.filename}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${filePath}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: filePath,
        url: fileUrl
      }
    });
  } catch (err) {
    next(err);
  }
};
