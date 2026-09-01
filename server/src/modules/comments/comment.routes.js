const express = require('express');
const commentController = require('./comment.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireProjectRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validation.middleware');
const {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
} = require('./comment.validation');

const router = express.Router();

router.use(authenticate);

router.post('/tasks/:taskId/comments', validate(createCommentSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), commentController.createComment);
router.get('/tasks/:taskId/comments', validate(getCommentsSchema), requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), commentController.getComments);
router.patch('/comments/:commentId', validate(updateCommentSchema), commentController.updateComment);
router.delete('/comments/:commentId', validate(deleteCommentSchema), commentController.deleteComment);

module.exports = router;
