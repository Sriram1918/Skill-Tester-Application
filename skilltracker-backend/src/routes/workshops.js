const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT * FROM workshops 
      WHERE user_id = ?
      ORDER BY date ASC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

// Get workshop stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const [stats] = await pool().query(`
      SELECT 
        COUNT(CASE WHEN status = 'upcoming' AND date >= CURRENT_DATE THEN 1 END) as upcoming_workshops,
        SUM(
          TIMESTAMPDIFF(HOUR, 
            STR_TO_DATE(CONCAT(date, ' ', SUBSTRING_INDEX(time, ' - ', 1)), '%Y-%m-%d %h:%i %p'),
            STR_TO_DATE(CONCAT(date, ' ', SUBSTRING_INDEX(time, ' - ', -1)), '%Y-%m-%d %h:%i %p')
          )
        ) as total_hours,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_workshops,
        COUNT(DISTINCT instructor) as total_instructors
      FROM workshops
      WHERE user_id = ?
      AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    `, [userId]);

    res.json({
      upcomingWorkshops: stats[0].upcoming_workshops || 0,
      totalHours: stats[0].total_hours || 0,
      completedWorkshops: stats[0].completed_workshops || 0,
      totalInstructors: stats[0].total_instructors || 0
    });
  } catch (error) {
    console.error('Error fetching workshop stats:', error);
    res.status(500).json({ error: 'Failed to fetch workshop statistics' });
  }
});

module.exports = router; 