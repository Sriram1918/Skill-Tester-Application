const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const [stats] = await pool().query(`
      SELECT 
        active_courses,
        certifications,
        skills_mastered,
        learning_hours
      FROM monthly_stats 
      WHERE user_id = ? AND MONTH(month) = MONTH(CURRENT_DATE)
      LIMIT 1
    `, [userId]);

    const current = stats[0] || {
      active_courses: 0,
      certifications: 0,
      skills_mastered: 0,
      learning_hours: 0
    };

    // Get previous month's stats for comparison
    const [prevStats] = await pool().query(`
      SELECT 
        active_courses,
        certifications,
        skills_mastered,
        learning_hours
      FROM monthly_stats 
      WHERE user_id = ? AND MONTH(month) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
      LIMIT 1
    `, [userId]);

    const previous = prevStats[0] || {
      active_courses: 0,
      certifications: 0,
      skills_mastered: 0,
      learning_hours: 0
    };

    res.json({
      activeCourses: {
        current: current.active_courses,
        change: calculatePercentageChange(previous.active_courses, current.active_courses)
      },
      certifications: {
        current: current.certifications,
        change: calculatePercentageChange(previous.certifications, current.certifications)
      },
      skillsMastered: {
        current: current.skills_mastered,
        change: calculatePercentageChange(previous.skills_mastered, current.skills_mastered)
      },
      learningHours: {
        current: current.learning_hours,
        change: calculatePercentageChange(previous.learning_hours, current.learning_hours)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT * FROM activities 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 5
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get upcoming deadlines
router.get('/deadlines', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT * FROM deadlines 
      WHERE user_id = ? AND status = 'pending'
      ORDER BY due_date ASC 
      LIMIT 5
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    res.status(500).json({ error: 'Failed to fetch deadlines' });
  }
});

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

module.exports = router; 