const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const redis = require('redis');
require('dotenv').config();

// Initialize auth controller (this sets up Passport strategies)
require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000/api',
      process.env.CLIENT_URL,
      'https://harmonia-ai.vercel.app'
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Create Redis client for sessions
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('❌ Redis session store error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis for session store');
});

redisClient.on('ready', () => {
  console.log('✅ Redis session store client ready');
});

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis for sessions:', err);
});

// Initialize RedisStore with error handling
let redisStore;
try {
  redisStore = new RedisStore({
    client: redisClient,
    prefix: 'harmonia:sess:'
  });
  console.log('✅ RedisStore initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize RedisStore:', error);
  // Fallback to MemoryStore for development
  console.warn('⚠️  Falling back to MemoryStore - NOT suitable for production!');
  redisStore = null;
}

// Session middleware (required for Passport) - using Redis store or fallback
const sessionConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use RedisStore if available, otherwise use default MemoryStore (not recommended for production)
if (redisStore) {
  sessionConfig.store = redisStore;
} else {
  console.warn('⚠️  Using MemoryStore for sessions - data will be lost on restart!');
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const claudeService = require('./services/claudeService');

// Initialize Claude service
async function initializeServices() {
  try {
    await claudeService.initialize();
    console.log('Claude service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Claude service:', error);
  }
}

// Initialize services before starting server
initializeServices();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;