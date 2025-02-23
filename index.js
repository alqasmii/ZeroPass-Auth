// index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Using your provided JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
const MAGIC_LINK_EXPIRES_IN = '15m';

app.use(bodyParser.json());

// Configure Nodemailer transporter using Gmail
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
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
    const magicLink = `http://localhost:${PORT}/magic-login?token=${token}`;

    // Email options
    const mailOptions = {
        from: 'your_email@gmail.com',  // Replace with your Gmail address
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
        // For testing, returning the magic link in the response
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
        
        // Successful authentication; here you can create a session or perform further actions.
        res.json({ message: 'User authenticated', email: decoded.email });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
