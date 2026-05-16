const userService = require('./userService');

exports.register = async (data) => {
  // userService.createUser will check duplicates and hash password via model
  return userService.createUser(data);
};

exports.login = async (email, password) => {
  const user = await userService.findByEmail(email);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 400 });
  const ok = await user.comparePassword(password);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { statusCode: 400 });
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
