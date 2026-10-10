const mongoose = require('mongoose');

const healthPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    sections: {
      introduction: String,
      dietaryPlan: String,
      exercisePlan: String,
      sleepCycle: String,
      monitoring: String,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

healthPlanSchema.index({ userId: 1, generatedAt: -1 });
healthPlanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('HealthPlan', healthPlanSchema);
