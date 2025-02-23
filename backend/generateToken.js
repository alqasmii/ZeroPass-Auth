const jwt = require('jsonwebtoken');

// Define your secret key (keep this safe in production!)
const secretKey = 'your_secret_key_here';

// Define the payload with your claims
const payload = {
  sub: 'user_id_here',                       // subject (user identifier)
  name: 'John Doe',                          // custom claim (optional)
  iat: Math.floor(Date.now() / 1000),          // issued at time
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // expires in 1 hour
};

// Create the token using HS256 algorithm (default)
const token = jwt.sign(payload, secretKey);

console.log('JWT Token:', token);
