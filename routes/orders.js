const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.route('/').get(getAllOrders).post(auth, createOrder);
router.route('/:id').get(getOrderById).delete(auth, deleteOrder);
router.patch('/:id/status', auth, updateOrderStatus);

module.exports = router;
