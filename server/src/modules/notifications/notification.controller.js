const Notification = require('./notification.model');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('actorId', 'name email avatar');
  return sendSuccess(res, 200, 'Notifications fetched successfully', notifications);
});

const markRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipientId: req.user._id },
    { isRead: true },
    { new: true }
  );
  return sendSuccess(res, 200, 'Notification marked as read', notification);
});

const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
  return sendSuccess(res, 200, 'All notifications marked as read');
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
