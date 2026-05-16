const Category = require('../models/Category');

exports.getAll = async () => {
  return Category.find().sort({ name: 1 });
};

exports.getById = async (id) => {
  return Category.findById(id);
};

exports.create = async (data) => {
  return Category.create(data);
};

exports.update = async (id, data) => {
  return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.delete = async (id) => {
  return Category.findByIdAndDelete(id);
};
