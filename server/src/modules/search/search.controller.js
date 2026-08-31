const Task = require('../tasks/task.model');
const Project = require('../projects/project.model');
const User = require('../users/user.model');
const OrganizationMember = require('../organizations/organizationMember.model');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const searchAll = catchAsync(async (req, res) => {
  const { q, type = 'all', organizationId } = req.query;
  if (!q) {
    return sendSuccess(res, 200, 'Search query empty', { tasks: [], projects: [], members: [] });
  }

  const regex = new RegExp(q, 'i');
  let tasks = [];
  let projects = [];
  let members = [];

  if (type === 'all' || type === 'task') {
    const taskQuery = {
      $or: [{ title: regex }, { taskKey: regex }, { description: regex }, { labels: regex }],
    };
    if (organizationId) taskQuery.organizationId = organizationId;

    tasks = await Task.find(taskQuery)
      .limit(10)
      .populate('assignee', 'name email avatar')
      .populate('projectId', 'name key');
  }

  if (type === 'all' || type === 'project') {
    const projQuery = {
      $or: [{ name: regex }, { key: regex }, { description: regex }],
    };
    if (organizationId) projQuery.organizationId = organizationId;

    projects = await Project.find(projQuery).limit(10);
  }

  if (type === 'all' || type === 'member') {
    if (organizationId) {
      const orgMembers = await OrganizationMember.find({ organizationId }).populate('userId', 'name email avatar');
      members = orgMembers
        .map((m) => m.userId)
        .filter((u) => u && (regex.test(u.name) || regex.test(u.email)))
        .slice(0, 10);
    } else {
      members = await User.find({ $or: [{ name: regex }, { email: regex }] }).limit(10);
    }
  }

  return sendSuccess(res, 200, 'Search results fetched', { tasks, projects, members });
});

module.exports = {
  searchAll,
};
