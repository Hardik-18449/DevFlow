const commentService = require('./comment.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(req.params.taskId, req.user._id, req.body);
  return sendSuccess(res, 201, 'Comment added successfully', comment);
});

const getComments = catchAsync(async (req, res) => {
  const comments = await commentService.getComments(req.params.taskId);
  return sendSuccess(res, 200, 'Comments fetched successfully', comments);
});

const updateComment = catchAsync(async (req, res) => {
  const comment = await commentService.updateComment(req.params.commentId, req.user._id, req.body.content);
  return sendSuccess(res, 200, 'Comment updated successfully', comment);
});

const deleteComment = catchAsync(async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user._id);
  return sendSuccess(res, 200, 'Comment deleted successfully');
});

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
