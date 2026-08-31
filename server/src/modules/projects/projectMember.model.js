const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['PROJECT_MANAGER', 'DEVELOPER', 'VIEWER'], default: 'DEVELOPER' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);
module.exports = ProjectMember;
