const Activity = require('./activity.model');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const getProjectActivities = catchAsync(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const activities = await Activity.find({ projectId: req.params.projectId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('actorId', 'name email avatar')
    .populate('taskId', 'title taskKey');

  const total = await Activity.countDocuments({ projectId: req.params.projectId });

  return sendSuccess(res, 200, 'Project activities fetched', activities, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / parseInt(limit, 10)),
  });
});

module.exports = {
  getProjectActivities,
};
