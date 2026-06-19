const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendVerificationEmail } = require('../services/emailService');

// Generate access token (short-lived: 15m)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (long-lived: 7d)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Enforce Password Security Policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Return vague message to prevent account enumeration
      return res.status(400).json({ success: false, message: 'Invalid Identification Credentials Provided.' });
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (default student, unpaid, unverified)
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      isPaid: false,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: tokenExpires
    });

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${token}`;
    
    // Dispatch actual verification email (or log to console in simulation fallback)
    try {
      await sendVerificationEmail(email, name, verifyUrl);
    } catch (mailErr) {
      console.error('[EMAIL ERROR] Failed to dispatch email. Continuing registration registration:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email using the link sent.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // We implement constant-time evaluation to prevent timing-based user enumeration
    const user = await User.findOne({ email }).select('+password');
    let isMatch = false;

    if (user) {
      isMatch = await user.matchPassword(password);
    } else {
      // Fake compare to consume CPU time equivalent to bcrypt
      const fakeSalt = await crypto.randomBytes(16).toString('hex');
      await crypto.pbkdf2Sync('fake_password', fakeSalt, 10000, 64, 'sha512');
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Identification Credentials Provided.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    // Access Token and Refresh Token generation
    const accessToken = generateAccessToken(user);
    const refreshTokenVal = generateRefreshToken(user);

    // Create a new token family
    const familyId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      token: refreshTokenVal,
      userId: user._id,
      familyId,
      expiresAt
    });

    // Set refresh token in cookie
    setRefreshTokenCookie(res, refreshTokenVal);

    // Track login/daily streak
    const lastLogin = user.lastLoginDate;
    const now = new Date();
    const diffTime = Math.abs(now - lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.dailyStreak += 1;
    } else if (diffDays > 1) {
      user.dailyStreak = 1;
    }
    user.lastLoginDate = now;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPaid: user.isPaid,
        isVerified: user.isVerified,
        dailyStreak: user.dailyStreak,
        weakTopics: user.weakTopics
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Refresh access token (Token Rotation & Family Protection)
// @route   POST /api/v1/auth/refresh
// @access  Public
exports.refresh = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const oldRefreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });

    // Look up token in DB
    const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });

    // Scenario A: Token reuse detected (Token theft)
    if (storedToken && storedToken.isUsed) {
      console.warn(`[SECURITY BREACH] Token reuse detected! Family: ${storedToken.familyId}`);
      // Invalidate the entire token family
      await RefreshToken.deleteMany({ familyId: storedToken.familyId });
      return res.status(403).json({ success: false, message: 'Token reuse detected. Session terminated.' });
    }

    // Scenario B: Token not found
    if (!storedToken) {
      return res.status(401).json({ success: false, message: 'Invalid token session' });
    }

    // Verify JWT Signature and check expiration
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // Token expired or malformed
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({ success: false, message: 'Token expired or invalid' });
    }

    // Verify that the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session not found' });
    }

    // Scenario C: Safe token rotation
    storedToken.isUsed = true;
    await storedToken.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshTokenVal = generateRefreshToken(user);

    // Save the new token under the same family
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      token: newRefreshTokenVal,
      userId: user._id,
      familyId: storedToken.familyId,
      expiresAt
    });

    // Send new refresh token in cookie
    setRefreshTokenCookie(res, newRefreshTokenVal);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public (Requires cookie)
exports.logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.sendStatus(204); // No content
    }

    const tokenVal = cookies.refreshToken;
    const storedToken = await RefreshToken.findOne({ token: tokenVal });

    if (storedToken) {
      // Delete all tokens in the family to clear all active sessions for this device trace
      await RefreshToken.deleteMany({ familyId: storedToken.familyId });
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify email address
// @route   GET /api/v1/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!user) {
      return res.status(400).send(`
        <html>
          <head>
            <style>
              body { font-family: sans-serif; background: #0f172a; color: #cbd5e1; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
              h1 { color: #f43f5e; margin-bottom: 20px; }
              p { font-size: 16px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background 0.3s; }
              a:hover { background: #7c3aed; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Verification Failed</h1>
              <p>The verification link is invalid, expired, or has already been used.</p>
              <a href="${frontendUrl}/login">Go to Login</a>
            </div>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.status(200).send(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(139, 92, 246, 0.3); padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2); }
            h1 { color: #10b981; margin-bottom: 20px; }
            p { font-size: 16px; line-height: 1.5; color: #cbd5e1; }
            a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); transition: transform 0.2s; }
            a:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Email Verified!</h1>
            <p>Your email has been verified successfully. You can now access Sindh Educational Academy.</p>
            <a href="${frontendUrl}/login">Access Portal</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all students (search/filter for Clerk/Admin)
// @route   GET /api/v1/auth/students
// @access  Private (Clerk/Admin)
exports.getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const students = await User.find(query).select('name email isPaid isVerified dailyStreak weakTopics');
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
