const Comment = require('./comment.model');
const Task = require('../tasks/task.model');
const User = require('../users/user.model');
const Activity = require('../activities/activity.model');
const Notification = require('../notifications/notification.model');
const ApiError = require('../../utils/apiError');
const { getIO } = require('../../sockets/socket');

const parseMentions = async (content) => {
  const mentionMatches = content.match(/@([a-zA-Z0-9._]+)/g);
  if (!mentionMatches) return [];

  const usernamesOrEmails = mentionMatches.map((m) => m.slice(1).toLowerCase());
  const users = await User.find({
    $or: [
      { name: { $in: usernamesOrEmails.map((u) => new RegExp(u, 'i')) } },
      { email: { $in: usernamesOrEmails } },
    ],
  });

  return users.map((u) => u._id);
};

const createComment = async (taskId, authorId, { content, parentCommentId, attachments }) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found.', 'NOT_FOUND');

  const mentionedUserIds = await parseMentions(content);

  const comment = await Comment.create({
    taskId,
    projectId: task.projectId,
    authorId,
    parentCommentId: parentCommentId || null,
    content,
    mentions: mentionedUserIds,
    attachments: attachments || [],
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('authorId', 'name email avatar')
    .populate('mentions', 'name email avatar');

  // Activity log
  const activity = await Activity.create({
    organizationId: task.organizationId,
    projectId: task.projectId,
    taskId,
    actorId: authorId,
    action: 'added_comment',
    metadata: { taskKey: task.taskKey, commentSnippet: content.substring(0, 40) },
  });

  // Trigger Notifications for mentioned users
  for (const recipientId of mentionedUserIds) {
    if (recipientId.toString() !== authorId.toString()) {
      const notif = await Notification.create({
        recipientId,
        actorId: authorId,
        type: 'MENTIONED',
        title: 'You were mentioned in a comment',
        message: `Mentioned you in task ${task.taskKey}: "${content.substring(0, 50)}..."`,
        entityType: 'COMMENT',
        entityId: comment._id,
      });
      getIO()?.to(`user:${recipientId}`).emit('notification.created', notif);
    }
  }

  // Socket broadcast to project room
  getIO()?.to(`project:${task.projectId}`).emit('comment.created', populatedComment);
  getIO()?.to(`project:${task.projectId}`).emit('activity.created', activity);

  return populatedComment;
};

const getComments = async (taskId) => {
  const comments = await Comment.find({ taskId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name email avatar')
    .populate('mentions', 'name email avatar');
  return comments;
};

const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found.', 'NOT_FOUND');

  if (comment.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own comments.', 'FORBIDDEN');
  }

  comment.content = content;
  comment.edited = true;
  await comment.save();

  const populated = await Comment.findById(comment._id)
    .populate('authorId', 'name email avatar')
    .populate('mentions', 'name email avatar');

  getIO()?.to(`project:${comment.projectId}`).emit('comment.updated', populated);
  return populated;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found.', 'NOT_FOUND');

  if (comment.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own comments.', 'FORBIDDEN');
  }

  await Comment.findByIdAndDelete(commentId);
  getIO()?.to(`project:${comment.projectId}`).emit('comment.deleted', { commentId });
  return true;
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
