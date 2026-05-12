const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

router.route('/').get(getAllOrders).post(createOrder);
router.route('/:id').get(getOrderById).delete(deleteOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
