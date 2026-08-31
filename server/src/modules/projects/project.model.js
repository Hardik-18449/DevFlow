const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'ON_HOLD', 'ARCHIVED', 'COMPLETED'], default: 'ACTIVE' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    startDate: { type: Date },
    dueDate: { type: Date },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

projectSchema.index({ organizationId: 1, key: 1 }, { unique: true });
projectSchema.index({ organizationId: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
