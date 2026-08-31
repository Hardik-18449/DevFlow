const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
    tokenHash: { type: String, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'], default: 'PENDING' },
  },
  { timestamps: true }
);

invitationSchema.index({ organizationId: 1, email: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);
module.exports = Invitation;
