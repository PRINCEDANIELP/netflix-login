// api/register.js - Vercel Serverless Function
const defaultUsers = [
  { id: 1, email: 'demo@example.com', password: 'password123', name: 'Demo User' }
];

if (!global._netflixUsers) {
  global._netflixUsers = [...defaultUsers];
}

function generateMockToken(userId) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `netflix-${userId}-${timestamp}-${randomString}`;
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  // Validation
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!name) errors.name = 'Name is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const users = global._netflixUsers;
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    // Update existing user
    existing.password = password;
    if (name) existing.name = name;
    return res.status(200).json({
      success: true,
      message: 'Account updated and logged in successfully',
      user: { id: existing.id, email: existing.email, name: existing.name },
      token: generateMockToken(existing.id)
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email: email.trim(),
    password,
    name: name.trim()
  };
  users.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token: generateMockToken(newUser.id)
  });
}
