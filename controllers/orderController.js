const orderService = require('../Services/orderService');

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

    const orders = await orderService.findOrders(filter);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { book: bookId, buyer: buyerFromBody, type, offeredBook, message, agreedPrice } = req.body;
    const buyer = (req.user && req.user._id) || buyerFromBody;

    const order = await orderService.createOrder({ bookId, buyer, type, offeredBook, message, agreedPrice });
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

    const order = await orderService.findOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const updated = await orderService.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Order status updated to '${status}'`, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });

    await orderService.deleteOrderById(req.params.id);
    res.json({ success: true, message: 'Order cancelled and removed', data: {} });
  } catch (err) {
    next(err);
  }
};
