DELIMITER //

CREATE TRIGGER update_monthly_stats
AFTER INSERT ON learning_streak
FOR EACH ROW
BEGIN
    INSERT INTO monthly_stats (
        user_id,
        month,
        completed_goals,
        total_goals,
        study_hours,
        active_courses,
        completed_courses
    )
    SELECT 
        NEW.user_id,
        DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'),
        (
            SELECT COUNT(*) 
            FROM courses 
            WHERE user_id = NEW.user_id 
            AND status = 'completed' 
            AND MONTH(completion_date) = MONTH(CURRENT_DATE)
        ),
        4, -- Default total goals
        COALESCE(
            (
                SELECT SUM(hours_spent) 
                FROM learning_streak 
                WHERE user_id = NEW.user_id 
                AND MONTH(date) = MONTH(CURRENT_DATE)
            ),
            0
        ),
        (
            SELECT COUNT(*) 
            FROM courses 
            WHERE user_id = NEW.user_id 
            AND status = 'active'
        ),
        (
            SELECT COUNT(*) 
            FROM courses 
            WHERE user_id = NEW.user_id 
            AND status = 'completed'
        )
    ON DUPLICATE KEY UPDATE
        completed_goals = VALUES(completed_goals),
        study_hours = VALUES(study_hours),
        active_courses = VALUES(active_courses),
        completed_courses = VALUES(completed_courses);
END //

DELIMITER ; 