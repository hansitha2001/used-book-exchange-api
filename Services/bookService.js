const Book = require('../models/Book');

exports.findBooks = async ({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
  const total = await Book.countDocuments(filter);
  const books = await Book.find(filter).populate('category', 'name slug').populate('seller', 'name location contactNumber').sort(sort).skip(skip).limit(limit);
  return { books, total };
};

exports.findBookById = async (id) => {
  return Book.findById(id).populate('category', 'name slug').populate('seller', 'name email location contactNumber');
};

exports.createBook = async (bookData) => {
  const book = await Book.create(bookData);
  await book.populate('category', 'name slug');
  await book.populate('seller', 'name location');
  return book;
};

exports.updateBookById = async (id, updates) => {
  return Book.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('category', 'name slug').populate('seller', 'name location');
};

exports.deleteBookById = async (id) => {
  return Book.findByIdAndDelete(id);
};
