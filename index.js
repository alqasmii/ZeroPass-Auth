const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Use environment variables for production; fallback values for testing
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const MAGIC_LINK_EXPIRES_IN = '15m';

app.use(bodyParser.json());

// Default route so visitors to the root URL get a welcome message
app.get('/', (req, res) => {
  res.send('Welcome to ZeroPass Auth API');
});

// Configure the Nodemailer transporter using environment variables for credentials
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'qckh guic urvc wvgw'
  }
});

// Endpoint to request a magic link
app.post('/request-magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Create a JWT token with the user's email
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: MAGIC_LINK_EXPIRES_IN });
  // Construct the magic link using the host from the request
  const magicLink = `https://${req.get('host')}/magic-login?token=${token}`;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your_email@gmail.com',
    to: email,
    subject: 'Your ZeroPass Auth Magic Link',
    text: `Click this link to log in: ${magicLink}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    // Return the magic link for testing purposes
    res.json({ message: 'Magic link sent', magicLink });
  });
});

// Endpoint to verify the magic link
app.get('/magic-login', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    // Successful authentication; perform your login logic here
    res.json({ message: 'User authenticated', email: decoded.email });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
