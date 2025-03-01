-- First, clean up existing data
DELETE FROM skill_progress WHERE user_id IN (1, 2);
DELETE FROM skills WHERE user_id IN (1, 2);

-- Reset auto-increment
ALTER TABLE skills AUTO_INCREMENT = 1;
ALTER TABLE skill_progress AUTO_INCREMENT = 1;

-- Get category IDs
SET @ml_category = (SELECT id FROM skill_categories WHERE name = 'Machine Learning');
SET @prog_category = (SELECT id FROM skill_categories WHERE name = 'Programming');
SET @devops_category = (SELECT id FROM skill_categories WHERE name = 'DevOps');
SET @system_category = (SELECT id FROM skill_categories WHERE name = 'System Design');
SET @leadership_category = (SELECT id FROM skill_categories WHERE name = 'Leadership');

-- For Test User (Backend/DevOps Focus)
INSERT INTO skills (name, category_id, proficiency_level, user_id) VALUES
('Node.js', @prog_category, 85, 1),
('Docker', @devops_category, 90, 1),
('Kubernetes', @devops_category, 82, 1),
('MongoDB', @prog_category, 88, 1),
('AWS', @devops_category, 75, 1),
('CI/CD', @devops_category, 80, 1),
('System Design', @system_category, 78, 1),
('Team Leadership', @leadership_category, 85, 1);

-- For Sarah (ML/AI Focus)
INSERT INTO skills (name, category_id, proficiency_level, user_id) VALUES
('TensorFlow', @ml_category, 92, 2),
('PyTorch', @ml_category, 88, 2),
('Python', @prog_category, 95, 2),
('Scikit-learn', @ml_category, 90, 2),
('Deep Learning', @ml_category, 85, 2),
('MLOps', @devops_category, 78, 2),
('Data Analysis', @ml_category, 92, 2),
('Research', @ml_category, 88, 2);

-- Insert progress history for Test User
INSERT INTO skill_progress (skill_id, user_id, proficiency_level, recorded_date) 
SELECT 
  s.id,
  1,
  CASE 
    WHEN dates.offset = 90 THEN s.proficiency_level - 25
    WHEN dates.offset = 60 THEN s.proficiency_level - 18
    WHEN dates.offset = 30 THEN s.proficiency_level - 10
    ELSE s.proficiency_level
  END,
  DATE_SUB(CURRENT_DATE, INTERVAL dates.offset DAY)
FROM skills s
CROSS JOIN (SELECT 90 as offset UNION SELECT 60 UNION SELECT 30 UNION SELECT 0) dates
WHERE s.user_id = 1;

-- Insert progress history for Sarah with both technical and soft skills
INSERT INTO skill_progress (skill_id, user_id, proficiency_level, recorded_date) 
SELECT 
  s.id,
  2,
  CASE 
    WHEN dates.offset = 90 THEN s.proficiency_level - 20
    WHEN dates.offset = 60 THEN s.proficiency_level - 15
    WHEN dates.offset = 30 THEN s.proficiency_level - 8
    ELSE s.proficiency_level
  END,
  DATE_SUB(CURRENT_DATE, INTERVAL dates.offset DAY)
FROM skills s
CROSS JOIN (SELECT 90 as offset UNION SELECT 60 UNION SELECT 30 UNION SELECT 0) dates
WHERE s.user_id = 2; 