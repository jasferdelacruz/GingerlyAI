const { User, RefreshToken } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, location, farmSize } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      location,
      farmSize,
      role: 'user' // Default role for registration
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo: req.body.deviceInfo || null
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo: req.body.deviceInfo || null
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, userId: decoded.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!storedToken || !storedToken.isValid()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = storedToken.user;

    // Check if user is still active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token
    await storedToken.update({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      message: 'Token refreshed successfully',
      tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke the specific refresh token
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken, userId: req.user.id } }
      );
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices
 */
const logoutAll = async (req, res, next) => {
  try {
    // Revoke all refresh tokens for the user
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId: req.user.id } }
    );

    res.json({
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, farmSize } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
      location: location !== undefined ? location : user.location,
      farmSize: farmSize !== undefined ? farmSize : user.farmSize
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    await user.update({ password: newPassword });

    // Revoke all refresh tokens to force re-login on all devices
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId: user.id } }
    );

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword
};
