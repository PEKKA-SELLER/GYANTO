const express = require('express');
const router = express.Router();
const {
  downloadPdf,
  getMyPurchases,
  checkPurchase,
} = require('../controllers/downloadController');
const { protect } = require('../middleware/authMiddleware');

// Must be before /:productId to avoid conflict
router.get('/purchases/my', protect, getMyPurchases);
router.get('/purchases/check/:productId', protect, checkPurchase);

// Stream PDF - optionalAuth for guest token support
const optionalAuth = (req, res, next) => {
  const token =
    (req.cookies && req.cookies.token) ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);
  if (!token) return next();
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
    next();
  });
};

router.get('/:productId', optionalAuth, downloadPdf);

module.exports = router;
