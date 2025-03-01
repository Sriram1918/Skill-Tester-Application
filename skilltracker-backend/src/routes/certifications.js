const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        id,
        name,
        issuer,
        DATE_FORMAT(issue_date, '%Y-%m-%d') as issue_date,
        DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date,
        credential_id,
        status,
        image_url
      FROM certifications 
      WHERE user_id = ?
      ORDER BY issue_date DESC
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const [stats] = await pool().query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'expiring' THEN 1 END) as expiring_soon,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired
      FROM certifications
      WHERE user_id = ?
    `, [userId]);

    res.json({
      total: stats[0].total || 0,
      active: stats[0].active || 0,
      expiringSoon: stats[0].expiring_soon || 0,
      expired: stats[0].expired || 0
    });
  } catch (error) {
    console.error('Error fetching certification stats:', error);
    res.status(500).json({ error: 'Failed to fetch certification statistics' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, issuer, issue_date, expiry_date, credential_id, status } = req.body;

    // Validate required fields
    if (!name || !issuer || !issue_date || !expiry_date || !credential_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool().query(
      `INSERT INTO certifications (user_id, name, issuer, issue_date, expiry_date, credential_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, name, issuer, issue_date, expiry_date, credential_id, status || 'active']
    );

    res.status(201).json({
      id: result.insertId,
      name,
      issuer,
      issue_date,
      expiry_date,
      credential_id,
      status: status || 'active'
    });
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

module.exports = router;