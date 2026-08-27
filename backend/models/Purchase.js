const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestEmail: { type: String, default: null },
    guestName: { type: String, default: null },
    downloadToken: { type: String, default: null },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

// Prevent duplicate purchases for logged-in users only
purchaseSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
