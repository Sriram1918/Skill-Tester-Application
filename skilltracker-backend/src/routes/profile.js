const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get Profile Overview
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const [overview] = await pool().query(`
      SELECT 
        u.name,
        u.email,
        COALESCE(SUM(ls.hours_spent), 0) as total_study_hours,
        (SELECT COUNT(*) FROM courses WHERE user_id = ? AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM certifications WHERE user_id = ?) as total_certificates,
        COALESCE(
          (SELECT COUNT(DISTINCT DATE(date))
           FROM learning_streak 
           WHERE user_id = ? 
           AND date >= CURRENT_DATE - INTERVAL 30 DAY
           AND date <= CURRENT_DATE), 0
        ) as current_streak,
        COALESCE(
          (SELECT MAX(streak_count)
           FROM (
             SELECT COUNT(*) as streak_count
             FROM learning_streak
             WHERE user_id = ?
             GROUP BY DATE_SUB(date, INTERVAL ROW_NUMBER() OVER (ORDER BY date) DAY)
           ) streaks), 0
        ) as longest_streak,
        COALESCE(AVG(c.rating), 0) as avg_course_rating
      FROM users u
      LEFT JOIN learning_streak ls ON u.id = ls.user_id
      LEFT JOIN courses c ON u.id = c.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId, userId, userId, userId, userId]);

    // Get Learning Goals Progress
    const [goals] = await pool().query(`
      SELECT 
        COALESCE(
          (SELECT COUNT(*) FROM courses 
           WHERE user_id = ? AND status = 'completed') * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM courses WHERE user_id = ?), 0),
        0) as course_completion,
        COALESCE(
          (SELECT SUM(hours_spent) FROM learning_streak 
           WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE)) * 100.0 / 
          (SELECT monthly_target FROM progress_targets WHERE user_id = ?),
        0) as study_time_target,
        COALESCE(
          (SELECT COUNT(*) FROM certifications 
           WHERE user_id = ? AND status = 'completed') * 100.0 /
          NULLIF((SELECT COUNT(*) FROM certifications WHERE user_id = ?), 0),
        0) as certification_goals
    `, [userId, userId, userId, userId, userId, userId]);

    // Get Monthly Goals
    const [monthlyGoals] = await pool().query(`
      SELECT 
        completed_goals,
        total_goals
      FROM monthly_stats 
      WHERE user_id = ? AND MONTH(month) = MONTH(CURRENT_DATE)
      LIMIT 1
    `, [userId]);

    res.json({
      profile: {
        name: overview[0].name,
        email: overview[0].email,
        studyHours: Math.round(overview[0].total_study_hours),
        completedCourses: overview[0].completed_courses,
        certificates: overview[0].total_certificates,
        currentStreak: overview[0].current_streak
      },
      goals: {
        courseCompletion: Math.round(goals[0].course_completion),
        studyTimeTarget: Math.round(goals[0].study_time_target),
        certificationGoals: Math.round(goals[0].certification_goals)
      },
      highlights: {
        longestStreak: overview[0].longest_streak,
        monthlyGoalsCompleted: monthlyGoals[0]?.completed_goals || 0,
        monthlyGoalsTotal: monthlyGoals[0]?.total_goals || 4,
        totalHours: Math.round(overview[0].total_study_hours),
        averageRating: overview[0].avg_course_rating.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error fetching profile overview:', error);
    res.status(500).json({ error: 'Failed to fetch profile overview' });
  }
});

// Get user profile
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        u.name,
        u.email,
        up.bio,
        up.job_title,
        up.location,
        up.website,
        up.avatar_url,
        up.joined_date,
        COALESCE(us.total_study_hours, 0) as studyHours,
        COALESCE(us.completed_courses, 0) as completedCourses,
        COALESCE(us.earned_certificates, 0) as earnedCertificates,
        COALESCE(us.current_streak, 0) as currentStreak
      FROM users u
      LEFT JOIN user_profile up ON u.id = up.user_id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get learning streak data
router.get('/streak', async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool().query(`
      SELECT 
        date,
        hours_spent as hoursSpent
      FROM learning_streak 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 7
    `, [userId]);

    res.json(rows.reverse());
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

module.exports = router; 