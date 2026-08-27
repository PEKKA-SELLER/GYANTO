const crypto = require('crypto');
const Razorpay = require('razorpay');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @access  Public (guest or logged-in)
const createOrder = async (req, res) => {
  try {
    const { productId, guestEmail, guestName } = req.body;
    const isGuest = !req.user;

    if (isGuest && (!guestEmail || !guestName)) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Check duplicate for logged-in users
    if (!isGuest) {
      const alreadyPurchased = await Purchase.findOne({ user: req.user._id, product: productId });
      if (alreadyPurchased) {
        return res.status(400).json({ success: false, message: 'Already purchased.' });
      }
    }

    // Free product
    if (product.isFree || product.price === 0) {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const purchaseData = {
        product: productId,
        amount: 0,
        status: 'completed',
        downloadToken,
        ...(isGuest ? { guestEmail, guestName } : { user: req.user._id }),
      };
      const purchase = await Purchase.create(purchaseData);
      return res.status(200).json({ success: true, free: true, downloadToken: purchase.downloadToken });
    }

    const order = await razorpay.orders.create({
      amount: product.price * 100,
      currency: 'INR',
      receipt: `receipt_${productId}_${Date.now()}`,
      notes: {
        productId: productId.toString(),
        guestEmail: guestEmail || '',
        guestName: guestName || '',
        userId: req.user ? req.user._id.toString() : '',
      },
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      productName: product.title,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Could not create payment order.' });
  }
};

// @route   POST /api/payment/verify
// @access  Public (guest or logged-in)
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, guestEmail, guestName } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !productId) {
      return res.status(400).json({ success: false, message: 'Missing payment fields.' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const isGuest = !req.user;
    const downloadToken = crypto.randomBytes(32).toString('hex');

    const purchaseData = {
      product: productId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: product.price,
      status: 'completed',
      downloadToken,
      ...(isGuest ? { guestEmail, guestName } : { user: req.user._id }),
    };

    let purchase;
    if (!isGuest) {
      purchase = await Purchase.findOneAndUpdate(
        { user: req.user._id, product: productId },
        purchaseData,
        { upsert: true, new: true }
      );
    } else {
      purchase = await Purchase.create(purchaseData);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified! Product unlocked.',
      downloadToken: purchase.downloadToken,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
};

module.exports = { createOrder, verifyPayment };
