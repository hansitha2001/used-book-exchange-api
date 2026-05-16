const bookService = require('../Services/bookService');

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
    const { books, total } = await bookService.findBooks({ filter, skip, limit: Number(limit) });

    res.json({ success: true, count: books.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: books });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await bookService.findBookById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, description, category, condition, price, isAvailableForExchange, seller: sellerFromBody, images, language, publishedYear } = req.body;
    const seller = req.user ? req.user._id : sellerFromBody;
    const book = await bookService.createBook({ title, author, isbn, description, category, condition, price, isAvailableForExchange, seller, images, language, publishedYear });
    res.status(201).json({ success: true, message: 'Book listed successfully', data: book });
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, description, category, condition, price, isAvailableForExchange, isAvailable, images, language, publishedYear } = req.body;
    const bookDoc = await bookService.findBookById(req.params.id);
    if (!bookDoc) return res.status(404).json({ success: false, message: 'Book not found' });

    const updates = {
      title: title ?? bookDoc.title,
      author: author ?? bookDoc.author,
      isbn: isbn ?? bookDoc.isbn,
      description: description ?? bookDoc.description,
      category: category ?? bookDoc.category,
      condition: condition ?? bookDoc.condition,
      price: price ?? bookDoc.price,
      isAvailableForExchange: isAvailableForExchange ?? bookDoc.isAvailableForExchange,
      isAvailable: isAvailable ?? bookDoc.isAvailable,
      images: images ?? bookDoc.images,
      language: language ?? bookDoc.language,
      publishedYear: publishedYear ?? bookDoc.publishedYear,
    };

    const book = await bookService.updateBookById(req.params.id, updates);
    res.json({ success: true, message: 'Book listing updated', data: book });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await bookService.findBookById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    await bookService.deleteBookById(req.params.id);
    res.json({ success: true, message: 'Book listing removed', data: {} });
  } catch (err) {
    next(err);
  }
};
