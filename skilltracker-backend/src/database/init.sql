-- Insert initial user
INSERT INTO users (name, email, password_hash) 
VALUES ('Test User', 'test@example.com', 'password123');

SET @user_id = LAST_INSERT_ID();

-- Insert user profile
INSERT INTO user_profile (
  user_id, full_name, bio, job_title, location, website,
  joined_date, total_study_hours, completed_courses,
  earned_certificates, current_streak
) VALUES (
  @user_id,
  'Test User',
  'Full Stack Developer passionate about learning',
  'Senior Developer',
  'New York, USA',
  'https://example.com',
  CURRENT_DATE - INTERVAL 6 MONTH,
  102,
  3,
  8,
  5
);

-- Insert user stats
INSERT INTO user_stats (
  user_id, completed_courses, earned_certificates,
  total_study_hours, current_streak
) VALUES (@user_id, 3, 8, 102, 5);

-- Insert skill categories
INSERT INTO skill_categories (name, type) VALUES
('Machine Learning', 'technical'),
('Programming', 'technical'),
('DevOps', 'technical'),
('Cloud', 'technical'),
('Leadership', 'soft'),
('Problem Solving', 'soft');

-- Set variables for category IDs
SET @ml_category = (SELECT id FROM skill_categories WHERE name = 'Machine Learning');
SET @prog_category = (SELECT id FROM skill_categories WHERE name = 'Programming');
SET @devops_category = (SELECT id FROM skill_categories WHERE name = 'DevOps');
SET @cloud_category = (SELECT id FROM skill_categories WHERE name = 'Cloud');
SET @leadership_category = (SELECT id FROM skill_categories WHERE name = 'Leadership');
SET @problem_solving_category = (SELECT id FROM skill_categories WHERE name = 'Problem Solving');

-- Insert skills using category IDs
INSERT INTO skills (name, category_id, proficiency_level, user_id) VALUES
('TensorFlow', @ml_category, 90, @user_id),
('PyTorch', @ml_category, 85, @user_id),
('Python', @prog_category, 95, @user_id),
('Scikit-learn', @ml_category, 88, @user_id),
('Docker', @devops_category, 80, @user_id),
('Kubernetes', @devops_category, 75, @user_id),
('Team Leadership', @leadership_category, 92, @user_id),
('Problem Solving', @problem_solving_category, 95, @user_id),
('Node.js', @prog_category, 85, @user_id),
('MongoDB', @prog_category, 88, @user_id),
('AWS', @devops_category, 75, @user_id),
('CI/CD', @devops_category, 80, @user_id),
('System Design', @devops_category, 78, @user_id);

-- Insert courses
INSERT INTO courses (title, description, duration, status, progress, enrolled_users, rating, category, user_id) VALUES
('Advanced Web Development', 'Learn modern web development with React, Node.js, and TypeScript', '12 weeks', 'active', 75, 120, 4.80, 'Development', @user_id),
('Data Science Fundamentals', 'Master the basics of data science with Python and pandas', '8 weeks', 'active', 45, 85, 4.60, 'Data Science', @user_id),
('UI/UX Design Principles', 'Create beautiful and functional user interfaces', '6 weeks', 'active', 90, 150, 4.90, 'Design', @user_id),
('AWS Cloud Practitioner', 'Cloud computing basics', '6 weeks', 'completed', 100, 200, 4.60, 'Cloud', @user_id);

-- Insert certifications
INSERT INTO certifications (name, issuer, issue_date, expiry_date, credential_id, status, user_id) VALUES
('AWS Certified Developer', 'Amazon Web Services', CURRENT_DATE - INTERVAL 3 MONTH, CURRENT_DATE + INTERVAL 9 MONTH, 'AWS-123', 'active', @user_id),
('Professional Scrum Master', 'Scrum.org', CURRENT_DATE - INTERVAL 6 MONTH, CURRENT_DATE + INTERVAL 6 MONTH, 'PSM-456', 'active', @user_id),
('MongoDB Developer', 'MongoDB University', CURRENT_DATE - INTERVAL 2 MONTH, CURRENT_DATE + INTERVAL 10 MONTH, 'MDB-789', 'active', @user_id);

-- Insert workshops
INSERT INTO workshops (title, description, date, time, location, instructor, participants, max_participants, status, user_id) VALUES
('React Advanced Patterns', 'Deep dive into React patterns and best practices', CURRENT_DATE + INTERVAL 7 DAY, '10:00 AM - 2:00 PM', 'Online', 'John Smith', 15, 30, 'upcoming', @user_id),
('System Design Workshop', 'Learn to design scalable systems', CURRENT_DATE + INTERVAL 14 DAY, '2:00 PM - 6:00 PM', 'Online', 'Jane Doe', 12, 25, 'upcoming', @user_id);

-- Insert monthly stats
INSERT INTO monthly_stats (user_id, month, active_courses, certifications, skills_mastered, learning_hours) VALUES
(@user_id, CURRENT_DATE, 3, 3, 5, 102);

-- Insert monthly reports
INSERT INTO monthly_reports (
  user_id, month, progress_percentage, learning_goals_completed,
  learning_goals_total, study_hours, certifications_completed
) VALUES
(@user_id, CURRENT_DATE, 75, 3, 4, 102, 3);

-- Insert learning hours
INSERT INTO learning_hours (user_id, month, category, hours) VALUES
(@user_id, CURRENT_DATE, 'Development', 45),
(@user_id, CURRENT_DATE, 'Cloud', 30),
(@user_id, CURRENT_DATE, 'Design', 27);

-- Insert learning streak for the last 7 days
INSERT INTO learning_streak (user_id, date, hours_spent) VALUES
(@user_id, CURRENT_DATE - INTERVAL 6 DAY, 2.5),
(@user_id, CURRENT_DATE - INTERVAL 5 DAY, 3.0),
(@user_id, CURRENT_DATE - INTERVAL 4 DAY, 2.0),
(@user_id, CURRENT_DATE - INTERVAL 3 DAY, 4.0),
(@user_id, CURRENT_DATE - INTERVAL 2 DAY, 3.5),
(@user_id, CURRENT_DATE - INTERVAL 1 DAY, 2.5),
(@user_id, CURRENT_DATE, 3.0);

-- Insert skill recommendations
INSERT INTO skill_recommendations (skill_name, priority, user_id) VALUES
('GraphQL', 'high', @user_id),
('Kubernetes', 'medium', @user_id),
('TypeScript', 'high', @user_id);

-- Insert skill distribution
INSERT INTO skill_distribution (user_id, category, percentage) VALUES
(@user_id, 'Frontend', 35),
(@user_id, 'Backend', 30),
(@user_id, 'DevOps', 20),
(@user_id, 'Soft Skills', 15);

-- Insert recent activities
INSERT INTO activities (user_id, activity_type, activity_title, activity_description) VALUES
(@user_id, 'course_completion', 'Completed AWS Course', 'Successfully completed AWS Cloud Practitioner certification course'),
(@user_id, 'certification', 'New Certification', 'Earned AWS Certified Developer certification'),
(@user_id, 'skill_progress', 'React Skill Update', 'Improved React proficiency to 85%');

-- Insert deadlines
INSERT INTO deadlines (user_id, title, type, due_date, status) VALUES
(@user_id, 'Complete React Course', 'course', CURRENT_DATE + INTERVAL 14 DAY, 'pending'),
(@user_id, 'AWS Certification Exam', 'certification', CURRENT_DATE + INTERVAL 30 DAY, 'pending');

-- Insert progress targets
INSERT INTO progress_targets (user_id, overall_target, monthly_target, efficiency_target) VALUES
(@user_id, 85, 75, 80);

-- Insert monthly progress
INSERT INTO monthly_progress (user_id, month, completion_percentage, efficiency_percentage) VALUES
(@user_id, CURRENT_DATE, 75, 82);

-- Add initial skill progress data for the first user
INSERT INTO skill_progress (skill_id, user_id, proficiency_level, recorded_date) 
SELECT 
  s.id,
  s.user_id,
  CASE 
    WHEN dates.offset = 90 THEN s.proficiency_level - 20
    WHEN dates.offset = 60 THEN s.proficiency_level - 15
    WHEN dates.offset = 30 THEN s.proficiency_level - 10
    ELSE s.proficiency_level
  END,
  DATE_SUB(CURRENT_DATE, INTERVAL dates.offset DAY)
FROM skills s
CROSS JOIN (
  SELECT 90 as offset UNION SELECT 60 UNION SELECT 30 UNION SELECT 0
) dates
WHERE s.user_id = @user_id;

-- Skill progress for Test User
INSERT INTO skill_progress (skill_id, user_id, proficiency_level, recorded_date) 
SELECT 
  s.id,
  1,
  CASE 
    WHEN dates.offset = 90 THEN s.proficiency_level - 20
    WHEN dates.offset = 60 THEN s.proficiency_level - 15
    WHEN dates.offset = 30 THEN s.proficiency_level - 10
    ELSE s.proficiency_level
  END,
  DATE_SUB(CURRENT_DATE, INTERVAL dates.offset DAY)
FROM skills s
CROSS JOIN (SELECT 90 as offset UNION SELECT 60 UNION SELECT 30 UNION SELECT 0) dates
WHERE s.user_id = 1;

-- Continue with more initialization data...