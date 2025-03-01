import express from 'express';
import { pool } from '../db';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Get Skill Distribution
router.get('/skill-distribution', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT 
        sc.type as category,
        ROUND(AVG(s.proficiency_level)) as percentage
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE s.user_id = ?
      GROUP BY sc.type`;
    
    const [rows] = await pool().query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skill distribution:', error);
    res.status(500).json({ error: 'Failed to fetch skill distribution' });
  }
});

// Get Skill Growth
router.get('/skill-growth', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT 
        DATE_FORMAT(ls.date, '%b') as month,
        AVG(CASE WHEN sc.type = 'technical' THEN s.proficiency_level END) as technical,
        AVG(CASE WHEN sc.type = 'soft' THEN s.proficiency_level END) as soft
      FROM learning_streak ls
      JOIN skills s ON s.user_id = ls.user_id
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE ls.user_id = ?
      GROUP BY DATE_FORMAT(ls.date, '%b')
      ORDER BY MIN(ls.date)
      LIMIT 6`;
    
    const [rows] = await pool().query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skill growth:', error);
    res.status(500).json({ error: 'Failed to fetch skill growth' });
  }
});

// Get Hours Distribution
router.get('/hours-distribution', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT 
        DATE_FORMAT(ls.date, '%b') as month,
        SUM(ls.hours_spent) as hours
      FROM learning_streak ls
      WHERE ls.user_id = ?
      GROUP BY DATE_FORMAT(ls.date, '%b')
      ORDER BY MIN(ls.date)
      LIMIT 6`;
    
    const [rows] = await pool().query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hours distribution:', error);
    res.status(500).json({ error: 'Failed to fetch hours distribution' });
  }
});

// Get Certification Progress
router.get('/certification-progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT 
        c.name as category,
        COUNT(uc.id) as completed,
        SUM(CASE WHEN uc.status = 'in_progress' THEN 1 ELSE 0 END) as inProgress
      FROM certifications c
      LEFT JOIN user_certifications uc ON c.id = uc.certification_id AND uc.user_id = ?
      GROUP BY c.name`;
    
    const [rows] = await pool().query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching certification progress:', error);
    res.status(500).json({ error: 'Failed to fetch certification progress' });
  }
});

// Get Weekly Activity
router.get('/weekly-activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT 
        DATE_FORMAT(ls.date, '%a') as day,
        SUM(ls.hours_spent) as hours,
        COUNT(*) as tasks
      FROM learning_streak ls
      WHERE ls.user_id = ?
      AND ls.date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(ls.date, '%a')
      ORDER BY ls.date`;
    
    const [rows] = await pool().query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ error: 'Failed to fetch weekly activity' });
  }
});

export default router; 