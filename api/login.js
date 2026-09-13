// api/login.js - Vercel Serverless Function
const mockUsers = [
  { id: 1, email: 'demo@example.com', password: 'password123', name: 'Demo User' },
  { id: 2, email: 'test@netflix.com', password: 'netflix123', name: 'Test User' },
  { id: 3, email: 'user@example.com', password: 'secure456', name: 'Regular User' },
  { id: 4, email: 'princedaniel081104@gmail.com', password: 'prince123', name: 'Prince Daniel' },
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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, email: user.email, name: user.name },
    token: generateMockToken(user.id),
  });
}
