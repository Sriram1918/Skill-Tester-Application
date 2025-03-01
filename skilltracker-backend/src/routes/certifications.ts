const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Current problematic code
router.get('/certifications', async (req, res) => {
  try {
    const query = `
      SELECT * FROM certifications
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    // ... error handling
  }
});

// Fixed version - using authMiddleware and filtering by user_id
router.get('/certifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // This comes from authMiddleware
    const query = `
      SELECT * FROM certifications 
      WHERE user_id = ?
    `;
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching certifications:', err);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// Add new certification
router.post('/certifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, issuer, issue_date, expiry_date, credential_id, status } = req.body;

    // Validate required fields
    if (!name || !issuer || !issue_date || !expiry_date || !credential_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO certifications (
        user_id,
        name,
        issuer,
        issue_date,
        expiry_date,
        credential_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      userId,
      name,
      issuer,
      issue_date,
      expiry_date,
      credential_id,
      status || 'active'
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Certification added successfully'
    });
  } catch (err) {
    console.error('Error adding certification:', err);
    res.status(500).json({ error: 'Failed to add certification' });
  }
});

module.exports = router;