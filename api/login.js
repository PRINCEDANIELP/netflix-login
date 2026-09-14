// api/login.js - Vercel Serverless Function
// In-memory store (resets on cold start - fine for demo/bootcamp)
const mockUsers = [
  { id: 1, email: 'demo@example.com', password: 'password123', name: 'Demo User' }
];

// Shared registered users across requests (works within same serverless instance)
if (!global._netflixUsers) {
  global._netflixUsers = [...mockUsers];
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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = global._netflixUsers;
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'New user, please sign up first'
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Login failed: Incorrect password.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, email: user.email, name: user.name },
    token: generateMockToken(user.id)
  });
}
