const express = require('express');
const commentController = require('./comment.controller');
const authenticate = require('../../middleware/auth.middleware');
const { requireProjectRole } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/tasks/:taskId/comments', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), commentController.createComment);
router.get('/tasks/:taskId/comments', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']), commentController.getComments);
router.patch('/comments/:commentId', commentController.updateComment);
router.delete('/comments/:commentId', commentController.deleteComment);

module.exports = router;
