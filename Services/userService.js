const User = require('../models/User');

exports.getAllUsers = async () => {
  return User.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
};

exports.getUserById = async (id) => {
  return User.findById(id).select('-password').populate('listedBooks', 'title author price condition isAvailable');
};

exports.createUser = async (data) => {
  const { email } = data;
  const existing = await User.findOne({ email: email?.toLowerCase() });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
  const user = await User.create(data);
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

exports.updateUser = async (id, updates) => {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
};

exports.deactivateUser = async (id) => {
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
};

exports.findByEmail = async (email) => {
  return User.findOne({ email: email?.toLowerCase() });
};
