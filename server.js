const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssSanitize = require('./middleware/xssMiddleware');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "ws://localhost:5173", "http://localhost:5000", "http://localhost:5173"],
        mediaSrc: ["'self'", "blob:", "http://localhost:5000"]
      }
    }
  })
);

// CORS setup for local SPA communication
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize MongoDB Queries (NoSQL Injection Defense)
app.use(mongoSanitize());

// Sanitize Inputs against HTML XSS Payloads
app.use(xssSanitize);

// Rate Limiter to mitigate brute force & DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  message: {
    success: false,
    message: 'Too many operational requests from this IP. Gateway throttled.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Load API Services
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/billing', require('./routes/billingRoutes'));
app.use('/api/v1/exams', require('./routes/examRoutes'));
app.use('/api/v1/resources', require('./routes/lectureRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// Root route for initial verification
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Sindh Educational Academy API Active.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error: Something went wrong.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
