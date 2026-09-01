const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
