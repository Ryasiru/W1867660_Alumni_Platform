const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();

// Import middleware
const { apiLimiter, authLimiter } = require('./middleware/ratelimiter');
const { sanitizeInput } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/AuthRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const bidRoutes = require('./routes/BidRoutes');
const adminRoutes = require('./routes/AdminRoutes.js');
const publicRoutes = require('./routes/PublicRoutes');

const app = express();

// Body parsers FIRST
app.use(express.json());

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' });
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;