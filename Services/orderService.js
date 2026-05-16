const Order = require('../models/Order');
const Book = require('../models/Book');

exports.findOrders = async (filter = {}) => {
  return Order.find(filter)
    .populate('book', 'title author price condition')
    .populate('buyer', 'name email location')
    .populate('seller', 'name email location')
    .populate('offeredBook', 'title author condition')
    .sort({ createdAt: -1 });
};

exports.findOrderById = async (id) => {
  return Order.findById(id)
    .populate('book', 'title author price condition images')
    .populate('buyer', 'name email contactNumber location')
    .populate('seller', 'name email contactNumber location')
    .populate('offeredBook', 'title author condition price');
};

exports.createOrder = async ({ bookId, buyer, type, offeredBook = null, message, agreedPrice }) => {
  const book = await Book.findById(bookId);
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  if (!book.isAvailable) throw Object.assign(new Error('This book is no longer available'), { statusCode: 400 });
  if (type === 'exchange' && !book.isAvailableForExchange) throw Object.assign(new Error('This book is not available for exchange'), { statusCode: 400 });

  const order = await Order.create({ book: bookId, buyer, seller: book.seller, type, offeredBook, message, agreedPrice });
  await order.populate('book', 'title author price');
  await order.populate('buyer', 'name email');
  await order.populate('seller', 'name email');
  if (order.offeredBook) await order.populate('offeredBook', 'title author');
  return order;
};

exports.updateStatus = async (orderId, status) => {
  const order = await Order.findById(orderId).populate('book', 'title author price');
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  order.status = status;
  await order.save();

  if (status === 'accepted') {
    await Book.findByIdAndUpdate(order.book._id, { isAvailable: false });
  }
  if (status === 'rejected' || status === 'cancelled') {
    await Book.findByIdAndUpdate(order.book._id, { isAvailable: true });
  }
  return order;
};

exports.deleteOrderById = async (id) => {
  return Order.findByIdAndDelete(id);
};
