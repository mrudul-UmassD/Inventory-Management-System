const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(cors());
app.use(express.json());

// Import routes
const productRoutes = require('./routes/products');

// Initialize database
db.init()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 