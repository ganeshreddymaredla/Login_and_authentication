// routes/user.js
// Protected user routes (require valid JWT token)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// GET /api/user/profile
// Get logged-in user's profile (protected)
// ─────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
