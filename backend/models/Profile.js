const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    location: String,
    fitnessGoal: {
      type: String,
      enum: ['weightLoss', 'muscleGain', 'generalFitness', 'endurance'],
      required: true,
    },
    height: { type: Number, required: true, min: 50, max: 300 },
    weight: { type: Number, required: true, min: 20, max: 500 },
    bodyMeasurements: String,
    bodyFatPercentage: Number,
    activityLevel: String,
    dietaryPreferences: String,
    exerciseHabits: String,
    medicalHistory: String,
    sleepPatterns: String,
    wearableData: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

profileSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Profile', profileSchema);
