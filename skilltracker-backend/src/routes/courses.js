const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query('SELECT * FROM courses WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Add a new course
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, duration, category, status, progress } = req.body;
    
    const query = `
      INSERT INTO courses (
        title, description, duration, category, 
        status, progress, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      title, 
      description, 
      duration, 
      category, 
      status || 'active', 
      progress || 0, 
      userId
    ];

    const [result] = await pool().query(query, params);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Course added successfully' 
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Failed to add course' });
  }
});

// Get course stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const [stats] = await pool().query(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_courses,
        SUM(CAST(SUBSTRING_INDEX(duration, ' ', 1) AS UNSIGNED)) as hours_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as certificates,
        ROUND(AVG(progress)) as avg_completion
      FROM courses
      WHERE user_id = ?
    `, [userId]);

    res.json({
      activeCourses: stats[0].active_courses || 0,
      hoursSpent: stats[0].hours_spent || 0,
      certificates: stats[0].certificates || 0,
      completion: `${stats[0].avg_completion || 0}%`
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({ error: 'Failed to fetch course statistics' });
  }
});

// Update course progress
router.put('/:id/progress', async (req, res) => {
  try {
    const userId = req.userId;
    const courseId = req.params.id;
    const { progress } = req.body;

    // Validate progress value
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    // Update progress for the specific course
    const query = 'UPDATE courses SET progress = ? WHERE id = ? AND user_id = ?';
    const [result] = await pool().query(query, [progress, courseId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found or unauthorized' });
    }

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ error: 'Failed to update course progress' });
  }
});

module.exports = router;