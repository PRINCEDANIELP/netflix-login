// api/login.js - Vercel Serverless Function
// Built-in demo users (always available)
const DEMO_USERS = [
  { id: 1, email: 'demo@example.com', password: 'password123', name: 'Demo User' }
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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password, clientVerified, userName } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check built-in demo users first
  const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (demoUser) {
    if (demoUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Login failed: Incorrect password.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: demoUser.id, email: demoUser.email, name: demoUser.name },
      token: generateMockToken(demoUser.id)
    });
  }

  // 2. For users registered via frontend (not in server memory):
  //    Frontend sends clientVerified=true after validating credentials locally.
  //    Backend trusts this and returns 200 so Network tab shows success.
  if (clientVerified === true) {
    const userId = Date.now();
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        email: cleanEmail,
        name: userName || cleanEmail.split('@')[0]
      },
      token: generateMockToken(userId)
    });
  }

  // 3. User not found in backend (and not client-verified)
  return res.status(401).json({
    success: false,
    message: 'New user, please sign up first'
  });
}
