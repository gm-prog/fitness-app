const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.methods.hashPassword = function (password) {
  return crypto.createHash('sha256').update(password).digest('hex');
};

userSchema.methods.comparePassword = function (plainPassword, hashedPassword) {
  return this.hashPassword(plainPassword) === hashedPassword;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = this.hashPassword(this.password);
  next();
});

module.exports = mongoose.model('User', userSchema);
