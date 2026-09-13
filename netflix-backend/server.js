// server.js - Express Backend
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock user database
const mockUsers = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User'
  },
  {
    id: 2,
    email: 'test@netflix.com',
    password: 'netflix123',
    name: 'Test User'
  },
  {
    id: 3,
    email: 'user@example.com',
    password: 'secure456',
    name: 'Regular User'
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Simulate database delay
  setTimeout(() => {
    // Find user
    const user = mockUsers.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Successful login - return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: generateMockToken(user.id) // Simple JWT-like token
    });
  }, 800); // Simulate network delay
});

// Registration endpoint (bonus)
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!name) {
    errors.name = 'Name is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    existingUser.password = password;
    if (name) existingUser.name = name;
    return res.status(200).json({
      success: true,
      message: 'Account updated and logged in successfully',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name
      },
      token: generateMockToken(existingUser.id)
    });
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    name
  };

  mockUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    },
    token: generateMockToken(newUser.id)
  });
});

// Verify token endpoint
app.post('/api/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }

  // Simple token verification (in production, use JWT)
  const userId = parseInt(token.split('-')[1]);
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// Get all registered users (for testing only)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: mockUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name
    }))
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🎬 Netflix Clone Server Running`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`\n✅ Available Endpoints:`);
  console.log(`   POST   /api/login      - User login`);
  console.log(`   POST   /api/register   - User registration`);
  console.log(`   POST   /api/verify     - Verify token`);
  console.log(`   GET    /api/users      - Get all users (test)`);
  console.log(`\n🧪 Test Credentials:`);
  console.log(`   Email:    demo@example.com`);
  console.log(`   Password: password123`);
  console.log(`\n${'='.repeat(50)}\n`);
});

// Helper function to generate mock token
function generateMockToken(userId) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `netflix-${userId}-${timestamp}-${randomString}`;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server');
  process.exit(0);
});
