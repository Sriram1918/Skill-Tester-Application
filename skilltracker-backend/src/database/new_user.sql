-- Create second user (this will ignore if email already exists)
INSERT OR IGNORE INTO users (name, email, password_hash) 
VALUES ('Sarah Johnson', 'sarah@example.com', 'sarah123');

-- Retrieve the newly inserted user ID
WITH last_user AS (SELECT id FROM users ORDER BY id DESC LIMIT 1)
INSERT INTO user_profile (
  user_id, full_name, bio, job_title, location, website,
  joined_date, total_study_hours, completed_courses,
  earned_certificates, current_streak
) 
SELECT id, 'Sarah Johnson',
  'AI/ML Engineer passionate about deep learning and computer vision',
  'Senior ML Engineer', 'San Francisco, CA', 'https://sarahjohnson.dev',
  DATE('now', '-3 months'), 120, 6, 4, 8
FROM last_user;

-- Insert user stats
INSERT INTO user_stats (
  user_id, completed_courses, earned_certificates,
  total_study_hours, current_streak
)
SELECT id, 6, 4, 120, 8 FROM last_user;

-- Insert skills for the new user
INSERT INTO skills (name, category_id, proficiency_level, user_id) 
SELECT 'TensorFlow', id, 92, (SELECT id FROM users ORDER BY id DESC LIMIT 1) FROM skill_categories WHERE name = 'Machine Learning'
UNION ALL
SELECT 'PyTorch', id, 88, (SELECT id FROM users ORDER BY id DESC LIMIT 1) FROM skill_categories WHERE name = 'Machine Learning'
UNION ALL
SELECT 'Python', id, 95, (SELECT id FROM users ORDER BY id DESC LIMIT 1) FROM skill_categories WHERE name = 'Programming';

-- Insert courses
INSERT INTO courses (title, description, duration, status, progress, enrolled_users, rating, category, user_id) 
SELECT 'Deep Learning Specialization', 'Master deep learning fundamentals with PyTorch', '16 weeks', 'active', 85, 200, 4.90, 'Machine Learning', id FROM last_user
UNION ALL
SELECT 'MLOps Engineering', 'Learn to deploy ML models at scale', '12 weeks', 'active', 70, 150, 4.85, 'DevOps', id FROM last_user;

-- Insert certifications
INSERT INTO certifications (name, issuer, issue_date, expiry_date, credential_id, status, user_id) 
SELECT 'TensorFlow Developer', 'Google', DATE('now', '-60 days'), DATE('now', '+300 days'), 'TF-123', 'active', id FROM last_user
UNION ALL
SELECT 'AWS ML Specialty', 'Amazon', DATE('now', '-120 days'), DATE('now', '+240 days'), 'AWS-ML-456', 'active', id FROM last_user;

-- Insert workshops
INSERT INTO workshops (title, description, date, time, location, instructor, participants, max_participants, status, user_id) 
SELECT 'Advanced Neural Networks', 'Deep dive into neural network architectures', DATE('now', '+10 days'), '9:00 AM - 1:00 PM', 'Online', 'Dr. Smith', 20, 35, 'upcoming', id FROM last_user;

-- Insert learning hours
INSERT INTO learning_hours (user_id, month, category, hours) 
SELECT id, DATE('now'), 'Machine Learning', 60 FROM last_user
UNION ALL
SELECT id, DATE('now'), 'DevOps', 35 FROM last_user;

-- Insert skill progress
INSERT INTO skill_progress (skill_id, user_id, proficiency_level, recorded_date) 
SELECT s.id, u.id,
  CASE 
    WHEN d.offset = 90 THEN s.proficiency_level - 20
    WHEN d.offset = 60 THEN s.proficiency_level - 15
    WHEN d.offset = 30 THEN s.proficiency_level - 10
    ELSE s.proficiency_level
  END,
  DATE('now', '-' || d.offset || ' days')
FROM skills s
JOIN (SELECT 90 AS offset UNION SELECT 60 UNION SELECT 30 UNION SELECT 0) d
JOIN users u ON u.id = (SELECT id FROM users ORDER BY id DESC LIMIT 1)
WHERE s.user_id = u.id;
