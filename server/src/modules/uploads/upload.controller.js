const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const requestUploadUrl = catchAsync(async (req, res) => {
  const { fileName, fileType, fileSize } = req.body;

  // Generate mock Cloudinary / S3 upload response matching spec
  const mockUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80`;

  return sendSuccess(res, 200, 'Upload URL generated successfully', {
    uploadUrl: mockUrl,
    fileUrl: mockUrl,
    name: fileName || 'attachment.png',
    mimeType: fileType || 'image/png',
    size: fileSize || 102450,
  });
});

module.exports = {
  requestUploadUrl,
};
