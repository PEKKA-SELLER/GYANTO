const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// optionalAuth - attach user if token present, else continue as guest
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

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, verifyPayment);

module.exports = router;
