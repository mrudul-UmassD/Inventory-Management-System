const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const db = require('./database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again after 15 minutes',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded by IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again after 15 minutes'
    });
  }
});

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this to handle URL-encoded form data

// Apply rate limiting to all API requests
app.use('/api', apiLimiter);

// Set up static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Import routes
const productRoutes = require('./routes/products');

// Initialize database
db.init()
  .then(() => {
    logger.info('Database initialized successfully');
  })
  .catch(err => {
    logger.error('Database initialization failed:', err);
    process.exit(1);
  });

// Use routes
app.use('/api/products', productRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});