const User = require('../models/User');

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('listedBooks', 'title author price condition isAvailable');
    if (!user || !user.isActive)
      return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, location, bio } = req.body;
    // Check for duplicate email
    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // NOTE: In production, hash the password before saving (e.g., bcrypt)
    const user = await User.create({ name, email, password, contactNumber, location, bio });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, message: 'User registered successfully', data: userObj });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    // Prevent updating email/password via this route
    const { name, contactNumber, location, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, contactNumber, location, bio },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User account deactivated', data: {} });
  } catch (err) {
    next(err);
  }
};
