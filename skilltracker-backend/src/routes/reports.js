const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const [currentStats] = await pool().query(`
      SELECT 
        COALESCE(progress_percentage, 0) as progress_percentage,
        COALESCE(learning_goals_completed, 0) as learning_goals_completed,
        COALESCE(learning_goals_total, 0) as learning_goals_total,
        COALESCE(study_hours, 0) as study_hours,
        COALESCE(certifications_completed, 0) as certifications_completed
      FROM monthly_reports 
      WHERE user_id = ? AND MONTH(month) = MONTH(CURRENT_DATE)
      LIMIT 1
    `, [userId]);

    // If no stats exist, create default stats
    if (!currentStats.length) {
      const defaultStats = {
        progress_percentage: 0,
        learning_goals_completed: 0,
        learning_goals_total: 4,
        study_hours: 0,
        certifications_completed: 0
      };
      
      // Insert default stats
      await pool().query(`
        INSERT INTO monthly_reports (
          user_id, month, progress_percentage, learning_goals_completed,
          learning_goals_total, study_hours, certifications_completed
        ) VALUES (?, CURRENT_DATE, ?, ?, ?, ?, ?)
      `, [userId, defaultStats.progress_percentage, defaultStats.learning_goals_completed,
          defaultStats.learning_goals_total, defaultStats.study_hours, defaultStats.certifications_completed]);
      
      currentStats[0] = defaultStats;
    }

    res.json({
      progress: currentStats[0].progress_percentage,
      goals: {
        completed: currentStats[0].learning_goals_completed,
        total: currentStats[0].learning_goals_total
      },
      studyTime: currentStats[0].study_hours,
      certifications: currentStats[0].certifications_completed
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Failed to fetch report statistics' });
  }
});

router.get('/hours-distribution', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(ls.date, '%b') as month,
        'Study Hours' as category,
        SUM(ls.hours_spent) as hours
      FROM learning_streak ls
      WHERE ls.user_id = ?
      GROUP BY DATE_FORMAT(ls.date, '%b')
      ORDER BY MIN(ls.date)
      LIMIT 6
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching hours distribution:', error);
    res.status(500).json({ error: 'Failed to fetch hours distribution' });
  }
});

router.get('/skill-distribution', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        sc.type as category,
        ROUND(AVG(s.proficiency_level), 2) as percentage
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE s.user_id = ?
      GROUP BY sc.type
    `, [userId]);

    // Ensure we have both categories even if one is empty
    const categories = ['technical', 'soft'];
    const result = categories.map(category => {
      const found = rows.find(row => row.category === category);
      return {
        category,
        percentage: found ? parseFloat(found.percentage) : 0
      };
    });

    console.log('Skill distribution data:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching skill distribution:', error);
    res.status(500).json({ error: 'Failed to fetch skill distribution' });
  }
});

router.get('/certification-history', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(issue_date, '%b') as month,
        COUNT(*) as count
      FROM certifications
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(issue_date, '%b'), MONTH(issue_date)
      ORDER BY MONTH(issue_date) ASC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching certification history:', error);
    res.status(500).json({ error: 'Failed to fetch certification history' });
  }
});

router.get('/skill-growth', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(sp.recorded_date, '%b') as month,
        sc.type as category,
        ROUND(AVG(sp.proficiency_level), 2) as level,
        MIN(sp.recorded_date) as order_date
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE sp.user_id = ?
      GROUP BY DATE_FORMAT(sp.recorded_date, '%b'), sc.type
      ORDER BY MIN(sp.recorded_date)
    `, [userId]);

    // Transform data for the chart
    const monthlyData = rows.reduce((acc, row) => {
      const existingMonth = acc.find(item => item.month === row.month);
      if (existingMonth) {
        existingMonth[row.category] = parseFloat(row.level);
      } else {
        acc.push({
          month: row.month,
          [row.category]: parseFloat(row.level)
        });
      }
      return acc;
    }, []);

    console.log('Skill growth data:', monthlyData);
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching skill growth:', error);
    res.status(500).json({ error: 'Failed to fetch skill growth data' });
  }
});

router.get('/daily-activity', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        COALESCE(SUM(hours_spent), 0) as hours
      FROM learning_streak
      WHERE user_id = ? 
      AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY date
      ORDER BY date ASC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching daily activity:', error);
    res.status(500).json({ error: 'Failed to fetch daily activity data' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const userId = req.userId;
    const [stats] = await pool().query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_skills,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT cert.id) as total_certifications,
        SUM(ls.hours_spent) as total_hours
      FROM users u
      LEFT JOIN skills s ON u.id = s.user_id
      LEFT JOIN courses c ON u.id = c.user_id
      LEFT JOIN certifications cert ON u.id = cert.user_id
      LEFT JOIN learning_streak ls ON u.id = ls.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    res.json(stats[0] || {
      total_skills: 0,
      total_courses: 0,
      total_certifications: 0,
      total_hours: 0
    });
  } catch (error) {
    console.error('Error fetching reports overview:', error);
    res.status(500).json({ error: 'Failed to fetch reports overview' });
  }
});

// Get Skills Distribution
router.get('/skills-distribution', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        sc.type,
        COUNT(*) as count,
        ROUND(AVG(s.proficiency_level), 2) as avg_proficiency
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE s.user_id = ?
      GROUP BY sc.type
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skills distribution:', error);
    res.status(500).json({ error: 'Failed to fetch skills distribution' });
  }
});

// Get Skills Progression
router.get('/skills-progression', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(sp.recorded_date, '%b') as month,
        ROUND(AVG(sp.proficiency_level), 2) as average_level
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      WHERE sp.user_id = ? AND s.user_id = ?
      GROUP BY 
        YEAR(sp.recorded_date),
        MONTH(sp.recorded_date)
      ORDER BY sp.recorded_date ASC
      LIMIT 6
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skills progression:', error);
    res.status(500).json({ error: 'Failed to fetch skills progression' });
  }
});

// Get Technical Skills Growth
router.get('/technical-growth', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(sp.recorded_date, '%b') as month,
        sc.name as category,
        ROUND(AVG(sp.proficiency_level), 2) as level
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE sp.user_id = ? AND s.user_id = ? 
      AND sc.type = 'technical'
      GROUP BY 
        YEAR(sp.recorded_date),
        MONTH(sp.recorded_date),
        sc.name
      ORDER BY sp.recorded_date ASC
      LIMIT 24
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching technical growth:', error);
    res.status(500).json({ error: 'Failed to fetch technical growth' });
  }
});

// Get Soft Skills Growth
router.get('/soft-growth', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        DATE_FORMAT(sp.recorded_date, '%b') as month,
        s.name as skill,
        sp.proficiency_level as level
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN skill_categories sc ON s.category_id = sc.id
      WHERE sp.user_id = ? AND s.user_id = ? 
      AND sc.type = 'soft'
      ORDER BY sp.recorded_date ASC
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching soft skills growth:', error);
    res.status(500).json({ error: 'Failed to fetch soft skills growth' });
  }
});

// Get Overall Skills Progress
router.get('/overall-progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      WITH monthly_averages AS (
        SELECT 
          DATE_FORMAT(sp.recorded_date, '%b') as month,
          sc.type,
          ROUND(AVG(sp.proficiency_level), 2) as avg_level,
          ROW_NUMBER() OVER (PARTITION BY sc.type ORDER BY sp.recorded_date DESC) as rn
        FROM skill_progress sp
        JOIN skills s ON sp.skill_id = s.id
        JOIN skill_categories sc ON s.category_id = sc.id
        WHERE sp.user_id = ? AND s.user_id = ?
        GROUP BY 
          YEAR(sp.recorded_date),
          MONTH(sp.recorded_date),
          sc.type
      )
      SELECT month, type, avg_level
      FROM monthly_averages
      WHERE rn <= 6
      ORDER BY month
    `, [userId, userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching overall progress:', error);
    res.status(500).json({ error: 'Failed to fetch overall progress' });
  }
});

module.exports = router; 