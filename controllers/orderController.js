const Order = require('../models/Order');
const Book = require('../models/Book');

// GET /api/orders
// Supports: ?buyer=id&seller=id&status=pending&type=buy
exports.getAllOrders = async (req, res, next) => {
  try {
    const { buyer, seller, status, type } = req.query;
    const filter = {};
    if (buyer) filter.buyer = buyer;
    if (seller) filter.seller = seller;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const orders = await Order.find(filter)
      .populate('book', 'title author price condition')
      .populate('buyer', 'name email location')
      .populate('seller', 'name email location')
      .populate('offeredBook', 'title author condition')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('book', 'title author price condition images')
      .populate('buyer', 'name email contactNumber location')
      .populate('seller', 'name email contactNumber location')
      .populate('offeredBook', 'title author condition price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { book: bookId, buyer, type, offeredBook, message, agreedPrice } = req.body;

    // Fetch the book to get the seller automatically
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (!book.isAvailable)
      return res.status(400).json({ success: false, message: 'This book is no longer available' });
    if (type === 'exchange' && !book.isAvailableForExchange)
      return res.status(400).json({ success: false, message: 'This book is not available for exchange' });

    const order = await Order.create({
      book: bookId,
      buyer,
      seller: book.seller,
      type,
      offeredBook: offeredBook || null,
      message,
      agreedPrice,
    });

    await order.populate('book', 'title author price');
    await order.populate('buyer', 'name email');
    await order.populate('seller', 'name email');
    if (order.offeredBook) await order.populate('offeredBook', 'title author');

    res.status(201).json({ success: true, message: 'Order request submitted', data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('book', 'title author price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Mark the book as unavailable when order is accepted
    if (status === 'accepted') {
      await Book.findByIdAndUpdate(order.book._id, { isAvailable: false });
    }
    // Re-mark available if order is rejected or cancelled
    if (status === 'rejected' || status === 'cancelled') {
      await Book.findByIdAndUpdate(order.book._id, { isAvailable: true });
    }

    res.json({ success: true, message: `Order status updated to '${status}'`, data: order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    await order.deleteOne();
    res.json({ success: true, message: 'Order cancelled and removed', data: {} });
  } catch (err) {
    next(err);
  }
};
