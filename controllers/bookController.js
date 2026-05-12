const Book = require('../models/Book');

// GET /api/books
// Supports: ?category=id&condition=good&minPrice=0&maxPrice=500&exchange=true&search=text&page=1&limit=10
exports.getAllBooks = async (req, res, next) => {
  try {
    const { category, condition, minPrice, maxPrice, exchange, search, page = 1, limit = 10 } = req.query;

    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (exchange === 'true') filter.isAvailableForExchange = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .populate('category', 'name slug')
      .populate('seller', 'name location contactNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: books.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: books,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name email location contactNumber');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, description, category, condition, price, isAvailableForExchange, seller, images, language, publishedYear } = req.body;
    const book = await Book.create({ title, author, isbn, description, category, condition, price, isAvailableForExchange, seller, images, language, publishedYear });
    await book.populate('category', 'name slug');
    await book.populate('seller', 'name location');
    res.status(201).json({ success: true, message: 'Book listed successfully', data: book });
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, description, category, condition, price, isAvailableForExchange, isAvailable, images, language, publishedYear } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, description, category, condition, price, isAvailableForExchange, isAvailable, images, language, publishedYear },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('seller', 'name location');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book listing updated', data: book });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book listing removed', data: {} });
  } catch (err) {
    next(err);
  }
};
