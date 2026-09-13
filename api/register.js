// api/register.js - Vercel Serverless Function
const mockUsers = [
  { id: 1, email: 'demo@example.com', password: 'password123', name: 'Demo User' },
  { id: 2, email: 'test@netflix.com', password: 'netflix123', name: 'Test User' },
  { id: 3, email: 'user@example.com', password: 'secure456', name: 'Regular User' },
];

function generateMockToken(userId) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `netflix-${userId}-${timestamp}-${randomString}`;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, password, name } = req.body;

  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!name) errors.name = 'Name is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const newUser = { id: mockUsers.length + 1, email, password, name };
  mockUsers.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token: generateMockToken(newUser.id),
  });
}
