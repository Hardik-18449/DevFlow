const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'TASK_ASSIGNED',
        'TASK_STATUS_CHANGED',
        'MENTIONED',
        'COMMENT_ADDED',
        'PROJECT_ADDED',
        'ORG_INVITATION',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, enum: ['TASK', 'PROJECT', 'COMMENT', 'ORGANIZATION'] },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
