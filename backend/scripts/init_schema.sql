-- Learning Online database bootstrap for an empty MySQL database.
-- Run this file against the database configured in backend/.env.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    avatar VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_categories_name (name),
    INDEX idx_categories_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) GENERATED ALWAYS AS (name) STORED,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    teacher_id INT NULL,
    category_id INT NULL,
    image VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_courses_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,
    INDEX idx_courses_teacher_id (teacher_id),
    INDEX idx_courses_category_id (category_id),
    INDEX idx_courses_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(1000) NULL,
    lesson_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lessons_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_lessons_course_order (course_id, lesson_order),
    INDEX idx_lessons_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress INT NOT NULL DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_enrollments_user_course (user_id, course_id),
    INDEX idx_enrollments_user_id (user_id),
    INDEX idx_enrollments_course_id (course_id),
    INDEX idx_enrollments_status (status),
    INDEX idx_enrollments_enrolled_at (enrolled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 0,
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_progress_lesson
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_progress_user_lesson (user_id, lesson_id),
    INDEX idx_progress_user_id (user_id),
    INDEX idx_progress_lesson_id (lesson_id),
    INDEX idx_progress_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_lesson
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_quizzes_lesson_id (lesson_id),
    INDEX idx_quizzes_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    content TEXT NOT NULL,
    question_type ENUM('single_choice', 'multiple_choice') NOT NULL DEFAULT 'single_choice',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        ON DELETE CASCADE,
    INDEX idx_questions_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    content TEXT NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_options_question
        FOREIGN KEY (question_id) REFERENCES questions(id)
        ON DELETE CASCADE,
    INDEX idx_question_options_question_id (question_id),
    INDEX idx_question_options_is_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    taken_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_quiz_results_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_quiz_results_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        ON DELETE CASCADE,
    INDEX idx_user_quiz_results_user_id (user_id),
    INDEX idx_user_quiz_results_quiz_id (quiz_id),
    INDEX idx_user_quiz_results_taken_at (taken_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    type VARCHAR(50) NULL,
    payment_method VARCHAR(100) NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_transactions_user_id (user_id),
    INDEX idx_transactions_payment_method (payment_method),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed accounts. Password for all seed users: 123456
INSERT IGNORE INTO users (id, name, email, password, role, balance) VALUES
(1, 'Admin Test', 'admin@test.com', '$2b$10$S4n7qnUOuhtw.jjArxqQ0OfMm3sEnvNrGSOUG13k0n1b7V/bG6mC6', 'admin', 1000000.00),
(2, 'Teacher Test', 'teacher@test.com', '$2b$10$S4n7qnUOuhtw.jjArxqQ0OfMm3sEnvNrGSOUG13k0n1b7V/bG6mC6', 'teacher', 0.00),
(3, 'Student Test', 'student@test.com', '$2b$10$S4n7qnUOuhtw.jjArxqQ0OfMm3sEnvNrGSOUG13k0n1b7V/bG6mC6', 'student', 500000.00);

INSERT IGNORE INTO categories (id, name, description, status) VALUES
(1, 'Programming', 'Programming and software development courses', 'active'),
(2, 'Design', 'Design and creative courses', 'active'),
(3, 'Business', 'Business and marketing courses', 'active'),
(4, 'Language', 'Language learning courses', 'active');

INSERT IGNORE INTO courses (id, name, description, price, teacher_id, category_id, image, created_at) VALUES
(1, 'React Beginner', 'Learn React fundamentals, components, state, props, and routing.', 199000.00, 2, 1, '/uploads/courses/react-beginner.jpg', NOW()),
(2, 'Node API', 'Build REST APIs with Node.js, Express, JWT, and MySQL.', 249000.00, 2, 1, '/uploads/courses/node-api.jpg', NOW()),
(3, 'UI/UX Design', 'Practice product thinking, wireframes, and clean user interface design.', 149000.00, 2, 2, '/uploads/courses/uiux-design.jpg', NOW());

INSERT IGNORE INTO lessons (id, course_id, title, video_url, lesson_order) VALUES
(1, 1, 'React overview', 'https://www.youtube.com/embed/SqcY0GlETPk', 1),
(2, 1, 'Components and props', 'https://www.youtube.com/embed/SqcY0GlETPk', 2),
(3, 2, 'Express server setup', 'https://www.youtube.com/embed/Oe421EPjeBE', 1),
(4, 2, 'REST API routes', 'https://www.youtube.com/embed/Oe421EPjeBE', 2),
(5, 3, 'Design process', 'https://www.youtube.com/embed/c9Wg6Cb_YlU', 1);

INSERT IGNORE INTO quizzes (id, lesson_id, title) VALUES
(1, 1, 'React overview quiz'),
(2, 3, 'Express setup quiz');

INSERT IGNORE INTO questions (id, quiz_id, content, question_type) VALUES
(1, 1, 'What is React mainly used for?', 'single_choice'),
(2, 1, 'Which hook is commonly used for component state?', 'single_choice'),
(3, 2, 'Which package is used by this backend HTTP server?', 'single_choice');

INSERT IGNORE INTO question_options (id, question_id, content, is_correct) VALUES
(1, 1, 'Building user interfaces', 1),
(2, 1, 'Managing Linux servers only', 0),
(3, 1, 'Creating MySQL databases only', 0),
(4, 2, 'useState', 1),
(5, 2, 'useDatabase', 0),
(6, 2, 'useBackend', 0),
(7, 3, 'express', 1),
(8, 3, 'react-dom', 0),
(9, 3, 'tailwindcss', 0);

INSERT IGNORE INTO enrollments (id, user_id, course_id, progress, status) VALUES
(1, 3, 1, 0, 'active');

