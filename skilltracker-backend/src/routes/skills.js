const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all skills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        s.id,
        s.name,
        sc.type as category,
        s.proficiency_level,
        COALESCE(GROUP_CONCAT(sp.proficiency_level ORDER BY sp.recorded_date), '') as history,
        COALESCE(GROUP_CONCAT(DATE_FORMAT(sp.recorded_date, '%b') ORDER BY sp.recorded_date), '') as dates
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      LEFT JOIN skill_progress sp ON s.id = sp.skill_id AND sp.user_id = ?
      WHERE s.user_id = ?
      GROUP BY s.id, s.name, sc.type, s.proficiency_level
      ORDER BY sc.type, s.name
    `, [userId, userId]);

    // Transform the data
    const skills = rows.map(skill => ({
      ...skill,
      history: skill.history ? skill.history.split(',').map(Number) : [],
      dates: skill.dates ? skill.dates.split(',') : []
    }));

    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get skills growth
router.get('/growth', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        MIN(DATE_FORMAT(sp.recorded_date, '%b')) as month,
        sc.type as category,
        ROUND(AVG(sp.proficiency_level), 2) as level
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE sp.user_id = ? AND s.user_id = ?
      GROUP BY 
        YEAR(sp.recorded_date),
        MONTH(sp.recorded_date),
        sc.type
      ORDER BY MIN(sp.recorded_date) ASC
      LIMIT 6
    `, [userId, userId]);
    
    // Ensure both technical and soft skills are represented for each month
    const months = [...new Set(rows.map(row => row.month))];
    const formattedData = months.map(month => {
      const monthData = {
        month,
        technical: 0,
        soft: 0
      };
      
      rows.forEach(row => {
        if (row.month === month) {
          monthData[row.category] = Number(row.level);
        }
      });
      
      return monthData;
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        s.id,
        s.name as skill_name,
        CASE 
          WHEN s.proficiency_level < 60 THEN 'high'
          WHEN s.proficiency_level < 80 THEN 'medium'
          ELSE 'low'
        END as priority
      FROM skills s
      WHERE s.user_id = ?
      ORDER BY s.proficiency_level ASC
      LIMIT 5
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get most used skills
router.get('/most-used', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        s.name,
        s.proficiency_level,
        COUNT(sp.id) as usage_count
      FROM skills s
      LEFT JOIN skill_progress sp ON s.id = sp.skill_id AND sp.user_id = ?
      WHERE s.user_id = ?
      GROUP BY s.id, s.name, s.proficiency_level
      ORDER BY usage_count DESC, s.proficiency_level DESC
      LIMIT 5
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching most used skills:', error);
    res.status(500).json({ error: 'Failed to fetch most used skills' });
  }
});

// Get recent improvements
router.get('/recent-improvements', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        s.name,
        sp.proficiency_level,
        sp.recorded_date
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      WHERE sp.user_id = ? AND s.user_id = ?
      ORDER BY sp.recorded_date DESC
      LIMIT 5
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent improvements:', error);
    res.status(500).json({ error: 'Failed to fetch recent improvements' });
  }
});

module.exports = router; 