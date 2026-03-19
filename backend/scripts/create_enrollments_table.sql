-- Create enrollments table for the Student Enrollment System
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_enrolled_at (enrolled_at)
);

-- Add some sample data (optional)
-- Insert sample enrollments
INSERT INTO enrollments (user_id, course_id, progress, status) 
SELECT u.id, c.id, FLOOR(RAND() * 100), 'active'
FROM users u
CROSS JOIN courses c
WHERE u.role = 'student'
LIMIT 10;
