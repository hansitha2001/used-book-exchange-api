const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const auth = require('../middleware/auth');

router.route('/').get(getAllBooks).post(auth, createBook);
router.route('/:id').get(getBookById).put(auth, updateBook).delete(auth, deleteBook);

module.exports = router;
