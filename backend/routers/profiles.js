const express = require('express');
const Profile = require('../models/Profile');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

const validateProfileData = (data) => {
  const required = ['name', 'age', 'gender', 'fitnessGoal', 'height', 'weight'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (data.age < 1 || data.age > 150) {
    return { valid: false, error: 'Age must be between 1 and 150' };
  }

  if (data.height < 50 || data.height > 300) {
    return { valid: false, error: 'Height must be between 50 and 300 cm' };
  }

  if (data.weight < 20 || data.weight > 500) {
    return { valid: false, error: 'Weight must be between 20 and 500 kg' };
  }

  return { valid: true };
};

router.post('/', async (req, res) => {
  try {
    const validation = validateProfileData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const profile = new Profile({
      userId: req.userId,
      ...req.body,
    });

    await profile.save();

    return res.status(201).json({
      message: 'Profile created successfully',
      profile,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({
      error: 'Failed to create profile',
      details: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.userId }).sort({ updatedAt: -1 });

    return res.status(200).json({ profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    return res.status(500).json({
      error: 'Failed to fetch profiles',
      details: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: 'Failed to fetch profile',
      details: error.message,
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validation = validateProfileData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: 'Failed to update profile',
      details: error.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({
      error: 'Failed to delete profile',
      details: error.message,
    });
  }
});

module.exports = router;
