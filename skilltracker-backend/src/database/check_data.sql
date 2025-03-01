-- Check user_stats
SELECT * FROM user_stats WHERE user_id = 1;

-- Check monthly_stats
SELECT * FROM monthly_stats WHERE user_id = 1 AND MONTH(month) = MONTH(CURRENT_DATE);

-- Check monthly_reports
SELECT * FROM monthly_reports WHERE user_id = 1 AND MONTH(month) = MONTH(CURRENT_DATE);

-- Check certifications
SELECT * FROM certifications WHERE user_id = 1;

-- Check courses
SELECT * FROM courses WHERE user_id = 1;

-- Check workshops
SELECT * FROM workshops;

-- Check skills
SELECT 
    s.*, 
    sc.name as category_name,
    sc.type as category_type
FROM skills s
JOIN skill_categories sc ON s.category_id = sc.id
WHERE s.user_id = 1; 