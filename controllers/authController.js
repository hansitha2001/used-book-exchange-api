const authService = require('../Services/authService');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, location, bio } = req.body;
    const userObj = await authService.register({ name, email, password, contactNumber, location, bio });
    const token = signToken(userObj);
    res.status(201).json({ success: true, message: 'User registered', data: { user: userObj, token } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });
    const userObj = await authService.login(email, password);
    const token = signToken(userObj);
    res.json({ success: true, data: { user: userObj, token } });
  } catch (err) {
    next(err);
  }
};
