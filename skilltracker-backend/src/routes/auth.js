const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Debug log

    // Get user from database
    const [users] = await pool().query(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    console.log('Found users:', users); // Debug log

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // For demo purposes, we're comparing plain passwords
    // In production, use proper password hashing
    if (password !== user.password_hash) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful, sending response');
    res.json({
      token,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Insert new user
    const [result] = await pool().query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password] // In production, hash the password!
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

module.exports = router; 