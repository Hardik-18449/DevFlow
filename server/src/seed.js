const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');
const connectDB = require('./config/db');
const User = require('./modules/users/user.model');
const Organization = require('./modules/organizations/organization.model');
const OrganizationMember = require('./modules/organizations/organizationMember.model');
const Project = require('./modules/projects/project.model');
const ProjectMember = require('./modules/projects/projectMember.model');
const Task = require('./modules/tasks/task.model');
const Comment = require('./modules/comments/comment.model');
const Activity = require('./modules/activities/activity.model');
const Notification = require('./modules/notifications/notification.model');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();
    console.log('[Seed] Wiping existing database...');

    await User.deleteMany({});
    await Organization.deleteMany({});
    await OrganizationMember.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

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

    console.log('[Seed] Creating demo Organization...');
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

    console.log('[Seed] Creating demo Projects...');
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

    const crmProject = await Project.create({
      organizationId: org._id,
      name: 'CRM Backend System',
      key: 'CRM',
      description: 'Microservice API for multi-tenant lead management and client onboarding.',
      ownerId: hardik._id,
      status: 'ACTIVE',
      priority: 'MEDIUM',
      startDate: new Date('2026-07-01'),
      dueDate: new Date('2026-12-01'),
    });

    await ProjectMember.create([
      { projectId: websiteProject._id, userId: hardik._id, role: 'PROJECT_MANAGER' },
      { projectId: websiteProject._id, userId: abhishek._id, role: 'PROJECT_MANAGER' },
      { projectId: websiteProject._id, userId: rahul._id, role: 'DEVELOPER' },
      { projectId: websiteProject._id, userId: priya._id, role: 'DEVELOPER' },
      { projectId: mobileProject._id, userId: abhishek._id, role: 'PROJECT_MANAGER' },
      { projectId: mobileProject._id, userId: rahul._id, role: 'DEVELOPER' },
    ]);

    console.log('[Seed] Creating sample Kanban Tasks...');
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
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-5',
        title: 'Redis Dashboard Analytics Caching',
        description: 'Cache project velocity metrics and invalidate cache on task mutations.',
        createdBy: hardik._id,
        assignee: abhishek._id,
        reporter: hardik._id,
        status: 'BACKLOG',
        priority: 'MEDIUM',
        labels: ['redis', 'backend', 'performance'],
        dueDate: new Date('2026-09-25'),
        estimatedHours: 10,
        position: 5,
      },
      {
        projectId: websiteProject._id,
        organizationId: org._id,
        taskKey: 'DFW-6',
        title: 'Automated CI/CD Pipeline & Docker setup',
        description: 'Configure GitHub actions workflow to run Jest tests and build production containers.',
        createdBy: abhishek._id,
        assignee: hardik._id,
        reporter: abhishek._id,
        status: 'BACKLOG',
        priority: 'LOW',
        labels: ['devops', 'docker'],
        dueDate: new Date('2026-10-01'),
        estimatedHours: 6,
        position: 6,
      },
    ];

    const createdTasks = await Task.create(tasksData);

    console.log('[Seed] Creating sample comments & mentions...');
    const comment1 = await Comment.create({
      taskId: createdTasks[1]._id, // DFW-2
      projectId: websiteProject._id,
      authorId: hardik._id,
      content: 'The API response needs pagination and secure CORS handling. @Rahul please verify.',
      mentions: [rahul._id],
    });

    const comment2 = await Comment.create({
      taskId: createdTasks[1]._id,
      projectId: websiteProject._id,
      authorId: rahul._id,
      parentCommentId: comment1._id,
      content: 'Done! Added cursor and skip-limit pagination with Zod schema validation.',
      mentions: [hardik._id],
    });

    console.log('[Seed] Creating activity audit logs...');
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
      {
        organizationId: org._id,
        projectId: websiteProject._id,
        taskId: createdTasks[1]._id,
        actorId: hardik._id,
        action: 'added_comment',
        metadata: { taskKey: 'DFW-2', commentSnippet: 'The API response needs pagination...' },
      },
    ]);

    console.log('[Seed] Creating demo notifications...');
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
      {
        recipientId: rahul._id,
        actorId: hardik._id,
        type: 'MENTIONED',
        title: 'You were mentioned in a comment',
        message: 'Hardik mentioned you in DFW-2',
        entityType: 'COMMENT',
        entityId: comment1._id,
      },
    ]);

    console.log('============================================');
    console.log('✅ Seed completed successfully!');
    console.log('Demo Credentials:');
    console.log('👑 Owner:  owner@devflow.com  / Password123!');
    console.log('🛡️ Admin:  admin@devflow.com  / Password123!');
    console.log('👨‍💻 Member: rahul@devflow.com  / Password123!');
    console.log('🎨 Member: priya@devflow.com  / Password123!');
    console.log('============================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
