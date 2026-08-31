const bcrypt = require('bcryptjs');
const User = require('../modules/users/user.model');
const Organization = require('../modules/organizations/organization.model');
const OrganizationMember = require('../modules/organizations/organizationMember.model');
const Project = require('../modules/projects/project.model');
const ProjectMember = require('../modules/projects/projectMember.model');
const Task = require('../modules/tasks/task.model');
const Comment = require('../modules/comments/comment.model');
const Activity = require('../modules/activities/activity.model');
const Notification = require('../modules/notifications/notification.model');

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[AutoSeed] Database already populated with ${userCount} users.`);
      return;
    }

    console.log('[AutoSeed] Database is empty. Auto-seeding initial demo dataset...');

    const passwordHash = '$2a$10$uWOnIRKBRWdplI5zBVgcQexwi9C3ptE5hqGMaubrht.5qKC2u.CeW';

    const hardik = await User.create({
      name: 'Hardik',
      email: 'owner@devflow.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      bio: 'Lead Architect & Tech Founder',
      isEmailVerified: true,
    });

    const abhishek = await User.create({
      name: 'Abhishek',
      email: 'admin@devflow.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      bio: 'Engineering Manager',
      isEmailVerified: true,
    });

    const rahul = await User.create({
      name: 'Rahul',
      email: 'rahul@devflow.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      bio: 'Senior Full Stack Developer',
      isEmailVerified: true,
    });

    const priya = await User.create({
      name: 'Priya',
      email: 'priya@devflow.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      bio: 'Lead UI/UX Designer',
      isEmailVerified: true,
    });

    const org = await Organization.create({
      name: 'CodingKart Technologies',
      slug: 'codingkart-tech',
      description: 'High performance software development agency and digital studio.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      ownerId: hardik._id,
    });

    await OrganizationMember.create([
      { organizationId: org._id, userId: hardik._id, role: 'OWNER' },
      { organizationId: org._id, userId: abhishek._id, role: 'ADMIN' },
      { organizationId: org._id, userId: rahul._id, role: 'MEMBER' },
      { organizationId: org._id, userId: priya._id, role: 'MEMBER' },
    ]);

    const websiteProject = await Project.create({
      organizationId: org._id,
      name: 'DevFlow Website Redesign',
      key: 'DFW',
      description: 'Modern developer-first landing page, dashboard, and real-time collaboration suite.',
      ownerId: hardik._id,
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-11-30'),
    });

    const mobileProject = await Project.create({
      organizationId: org._id,
      name: 'Mobile Application',
      key: 'MOB',
      description: 'Cross-platform iOS and Android companion app with real-time push notifications.',
      ownerId: abhishek._id,
      status: 'ACTIVE',
      priority: 'URGENT',
      startDate: new Date('2026-08-15'),
      dueDate: new Date('2026-10-15'),
    });

    await ProjectMember.create([
      { projectId: websiteProject._id, userId: hardik._id, role: 'PROJECT_MANAGER' },
      { projectId: websiteProject._id, userId: abhishek._id, role: 'PROJECT_MANAGER' },
      { projectId: websiteProject._id, userId: rahul._id, role: 'DEVELOPER' },
      { projectId: websiteProject._id, userId: priya._id, role: 'DEVELOPER' },
      { projectId: mobileProject._id, userId: abhishek._id, role: 'PROJECT_MANAGER' },
      { projectId: mobileProject._id, userId: rahul._id, role: 'DEVELOPER' },
    ]);

    const tasksData = [
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-1',
        title: 'Design Dark-First Workspace Theme',
        description: 'Craft high contrast glassmorphism design tokens for Linear-inspired layout.',
        createdBy: hardik._id,
        assignee: priya._id,
        reporter: hardik._id,
        status: 'DONE',
        priority: 'HIGH',
        labels: ['ui', 'design', 'frontend'],
        dueDate: new Date('2026-09-05'),
        estimatedHours: 12,
        position: 1,
      },
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-2',
        title: 'Implement JWT & Refresh Token Auth',
        description: 'Short-lived access token with HTTP-only refresh cookie rotation.',
        createdBy: abhishek._id,
        assignee: rahul._id,
        reporter: abhishek._id,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        labels: ['auth', 'backend', 'security'],
        dueDate: new Date('2026-09-10'),
        estimatedHours: 16,
        position: 2,
      },
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-3',
        title: 'Kanban Drag and Drop Interface',
        description: 'Integrate @dnd-kit sortable columns with optimistic UI task status updates.',
        createdBy: hardik._id,
        assignee: rahul._id,
        reporter: hardik._id,
        status: 'TODO',
        priority: 'HIGH',
        labels: ['kanban', 'frontend'],
        dueDate: new Date('2026-09-15'),
        estimatedHours: 20,
        position: 3,
      },
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-4',
        title: 'Socket.IO Room Broadcasting',
        description: 'Emit real-time task status changes to connected project members.',
        createdBy: abhishek._id,
        assignee: hardik._id,
        reporter: abhishek._id,
        status: 'IN_REVIEW',
        priority: 'HIGH',
        labels: ['socket', 'realtime'],
        dueDate: new Date('2026-09-12'),
        estimatedHours: 8,
        position: 4,
      },
    ];

    const createdTasks = await Task.create(tasksData);

    const comment1 = await Comment.create({
      taskId: createdTasks[1]._id,
      projectId: websiteProject._id,
      authorId: hardik._id,
      content: 'The API response needs pagination and secure CORS handling. @Rahul please verify.',
      mentions: [rahul._id],
    });

    await Activity.create([
      {
        organizationId: org._id,
        projectId: websiteProject._id,
        taskId: createdTasks[0]._id,
        actorId: priya._id,
        action: 'changed status: IN_PROGRESS → DONE',
        metadata: { taskKey: 'DFW-1' },
      },
      {
        organizationId: org._id,
        projectId: websiteProject._id,
        taskId: createdTasks[1]._id,
        actorId: rahul._id,
        action: 'changed status: TODO → IN_PROGRESS',
        metadata: { taskKey: 'DFW-2' },
      },
    ]);

    await Notification.create([
      {
        recipientId: hardik._id,
        actorId: rahul._id,
        type: 'TASK_STATUS_CHANGED',
        title: 'Task Status Updated',
        message: 'Rahul updated DFW-2 to IN_PROGRESS',
        entityType: 'TASK',
        entityId: createdTasks[1]._id,
      },
    ]);

    console.log('[AutoSeed] Database auto-seeded successfully with demo accounts & tasks!');
  } catch (err) {
    console.error('[AutoSeed Error]:', err);
  }
};

module.exports = autoSeedIfEmpty;
