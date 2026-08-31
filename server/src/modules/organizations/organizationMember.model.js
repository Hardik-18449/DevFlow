const mongoose = require('mongoose');

const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER'], default: 'MEMBER' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INVITED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

const OrganizationMember = mongoose.model('OrganizationMember', organizationMemberSchema);
module.exports = OrganizationMember;
