const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Order type is required'],
      enum: {
        values: ['buy', 'exchange'],
        message: 'Order type must be either buy or exchange',
      },
    },
    status: {
      type: String,
      default: 'pending',
      enum: {
        values: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        message: 'Invalid status value',
      },
    },
    // Only used when type === 'exchange'
    offeredBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    agreedPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
  },
  { timestamps: true }
);

// Validate: exchange orders must include an offeredBook
orderSchema.pre('save', function (next) {
  if (this.type === 'exchange' && !this.offeredBook) {
    return next(new Error('Exchange orders must include an offeredBook reference'));
  }
  // Buyer cannot be the same as seller when both are present
  if (this.buyer && this.seller && this.buyer.toString() === this.seller.toString()) {
    return next(new Error('Buyer and seller cannot be the same user'));
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
