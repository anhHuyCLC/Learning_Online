-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: lms_online_learning
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_logs`
--

DROP TABLE IF EXISTS `ai_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `input_context` json DEFAULT NULL,
  `recommended_output` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ai_user` (`user_id`),
  CONSTRAINT `fk_ai_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_logs`
--

LOCK TABLES `ai_logs` WRITE;
/*!40000 ALTER TABLE `ai_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Programming','Programming courses'),(2,'Web Development','Frontend and backend'),(3,'Mobile Development','Android and iOS'),(4,'Data Science','Data analysis and ML'),(5,'Artificial Intelligence','AI and Deep Learning'),(6,'Design','UI UX design'),(7,'Business','Business and startup'),(8,'Marketing','Digital marketing'),(9,'Photography','Photo and video editing'),(10,'Language','Language learning');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_skills`
--

DROP TABLE IF EXISTS `course_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `skill_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_skill` (`course_id`,`skill_id`),
  KEY `fk_cs_skill` (`skill_id`),
  CONSTRAINT `fk_cs_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cs_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_skills`
--

LOCK TABLES `course_skills` WRITE;
/*!40000 ALTER TABLE `course_skills` DISABLE KEYS */;
INSERT INTO `course_skills` VALUES (1,1,1),(2,1,3),(3,2,1),(4,2,3),(5,3,2),(6,3,4);
/*!40000 ALTER TABLE `course_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `teacher_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `thumbnail` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image` varchar(255) DEFAULT NULL,
  `detail_description` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'React for Beginners','Learn React from scratch',2,2,1500000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/react-beginner.jpg','This course teaches the fundamentals of React including components, props, state, hooks, and building real-world applications. Perfect for beginners starting frontend development.','2026-03-17 03:23:06'),(2,'Advanced React','React hooks and performance',2,2,2500000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/advanced-react.jpg','Deep dive into advanced React concepts such as custom hooks, performance optimization, context API, advanced patterns and scalable project architecture.','2026-03-17 03:23:06'),(3,'Node.js API Development','Build REST APIs',2,1,3750000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/node-api.jpg','Learn how to build powerful RESTful APIs using Node.js, Express and MySQL. Includes authentication, middleware, error handling and deployment.','2026-03-17 03:23:06'),(4,'JavaScript Masterclass','Modern JavaScript',3,1,2500000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/javascript-master.jpg','Master modern JavaScript including ES6+, async programming, promises, closures, modules and building interactive web applications.','2026-03-17 03:23:06'),(5,'UI UX Design Basics','Design fundamentals',3,6,3000000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/uiux-design.jpg','Learn UI/UX design principles including layout, typography, color theory, wireframing, prototyping and user experience optimization.','2026-03-17 03:23:06'),(6,'Machine Learning Intro','ML basics',3,4,6250000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/machine-learning.jpg','Introduction to Machine Learning concepts such as supervised learning, regression, classification, model evaluation and real-world AI examples.','2026-03-17 03:23:06'),(7,'Python for Beginners','Learn Python programming',2,1,2500000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/python-beginner.jpg','Start coding with Python. Learn variables, loops, functions, file handling and build simple automation scripts and applications.','2026-03-17 03:23:06'),(8,'Digital Marketing 101','Marketing strategies',3,8,4500000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/digital-marketing.jpg','Understand digital marketing fundamentals including SEO, social media marketing, content strategy, Google Ads and analytics.','2026-03-17 03:23:06'),(9,'Photography Basics','Camera and editing',2,9,2000000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/photography.jpg','Learn photography techniques including camera settings, composition, lighting and editing using professional tools.','2026-03-17 03:23:06'),(10,'English Speaking','Improve English speaking',3,10,1250000.00,NULL,'2026-03-16 03:26:28','/uploads/courses/english-speaking.jpg','Improve your English speaking skills with pronunciation practice, daily conversation, listening training and real-life communication.','2026-03-17 03:23:06');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `progress` decimal(5,2) DEFAULT '0.00',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (31,11,10,'2026-04-17 05:48:54',0.00,'active'),(32,11,7,'2026-03-19 03:01:51',0.00,'cancelled'),(45,11,1,'2026-04-02 09:05:59',0.00,'active'),(56,11,4,'2026-04-02 02:23:03',0.00,'cancelled'),(57,4,1,'2026-03-24 01:43:52',0.00,'active'),(58,4,2,'2026-03-19 10:38:03',0.00,'cancelled'),(59,4,3,'2026-03-19 10:38:03',0.00,'cancelled'),(60,4,4,'2026-03-24 02:18:10',0.00,'active'),(61,11,5,'2026-03-20 11:11:12',0.00,'cancelled'),(62,11,2,'2026-04-17 05:41:43',0.00,'cancelled'),(63,11,8,'2026-04-02 04:18:57',0.00,'active'),(64,11,9,'2026-04-06 10:58:13',0.00,'active'),(65,12,10,'2026-04-17 16:40:32',0.00,'active');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_path_details`
--

DROP TABLE IF EXISTS `learning_path_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_path_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `path_id` int NOT NULL,
  `course_id` int NOT NULL,
  `recommended_order` int NOT NULL,
  `recommended_reason` text,
  PRIMARY KEY (`id`),
  KEY `fk_detail_path` (`path_id`),
  KEY `fk_detail_course` (`course_id`),
  CONSTRAINT `fk_detail_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_path` FOREIGN KEY (`path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_path_details`
--

LOCK TABLES `learning_path_details` WRITE;
/*!40000 ALTER TABLE `learning_path_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_path_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_paths`
--

DROP TABLE IF EXISTS `learning_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_paths` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `generated_by` enum('AI','teacher') DEFAULT 'AI',
  `status` enum('active','completed') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_path_user` (`user_id`),
  CONSTRAINT `fk_path_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_paths`
--

LOCK TABLES `learning_paths` WRITE;
/*!40000 ALTER TABLE `learning_paths` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `content` text,
  `lesson_order` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,1,'Bài 1: Giới thiệu ReactJS','https://www.youtube.com/embed/x0fSBAgBrOQ','<p>Tìm hiểu tổng quan về React và lý do sử dụng.</p>',1,300),(2,1,'Bài 2: Cài đặt môi trường (Node.js & Vite)','https://www.youtube.com/embed/Y2hgEGPzTZY','<p>Hướng dẫn cài đặt môi trường và khởi tạo dự án.</p>',2,450),(3,1,'Bài 3: Cú pháp JSX cơ bản','https://www.youtube.com/embed/w7ejDZ8SWv8','<p>Cách viết HTML bên trong JavaScript.</p>',3,500),(4,1,'Bài 4: Component & Props','https://www.youtube.com/embed/x0fSBAgBrOQ','<p>Chia nhỏ giao diện và truyền dữ liệu.</p>',4,600),(5,1,'Bài 5: State & Lifecycle','https://www.youtube.com/embed/Y2hgEGPzTZY','<p>Quản lý trạng thái và vòng đời của Component.</p>',5,700),(6,2,'Bài 1: React Hooks chuyên sâu','https://www.youtube.com/embed/O6P86uwfdR0','<p>Tìm hiểu chi tiết useEffect, useMemo, useCallback.</p>',1,400),(7,2,'Bài 2: Tự xây dựng Custom Hooks','https://www.youtube.com/embed/O6P86uwfdR0','<p>Tái sử dụng logic với Custom Hooks.</p>',2,450),(8,2,'Bài 3: Quản lý State với Context API','https://www.youtube.com/embed/O6P86uwfdR0','<p>Giải quyết vấn đề Props Drilling.</p>',3,500),(9,2,'Bài 4: Tích hợp Redux Toolkit','https://www.youtube.com/embed/O6P86uwfdR0','<p>Quản lý Global State hiệu quả.</p>',4,600),(10,2,'Bài 5: Tối ưu hiệu suất (Code Splitting)','https://www.youtube.com/embed/O6P86uwfdR0','<p>Tăng tốc độ tải trang bằng Lazy Loading.</p>',5,700),(11,3,'Bài 1: Node.js Architecture','https://www.youtube.com/embed/z2fRVveWsjQ','<p>Kiến trúc Event-Driven của Node.js.</p>',1,300),(12,3,'Bài 2: ExpressJS Basics','https://www.youtube.com/embed/z2fRVveWsjQ','<p>Khởi tạo Web Server với Express.</p>',2,400),(13,3,'Bài 3: Kết nối MySQL','https://www.youtube.com/embed/z2fRVveWsjQ','<p>Thao tác cơ sở dữ liệu bằng mysql2.</p>',3,500),(14,3,'Bài 4: Thiết kế RESTful API','https://www.youtube.com/embed/z2fRVveWsjQ','<p>Xây dựng các endpoint CRUD chuẩn REST.</p>',4,600),(15,3,'Bài 5: JWT Authentication','https://www.youtube.com/embed/z2fRVveWsjQ','<p>Bảo mật API với JSON Web Token.</p>',5,700),(16,4,'Bài 1: Tính năng của ES6+','https://www.youtube.com/embed/0SJE9dYdpps','<p>Arrow functions, Destructuring, Spread Operator.</p>',1,300),(17,4,'Bài 2: Thao tác DOM (DOM Manipulation)','https://www.youtube.com/embed/0SJE9dYdpps','<p>Tương tác với các phần tử HTML trên trang.</p>',2,400),(18,4,'Bài 3: Lập trình bất đồng bộ','https://www.youtube.com/embed/0SJE9dYdpps','<p>Promises và Async/Await.</p>',3,500),(19,4,'Bài 4: OOP trong JavaScript','https://www.youtube.com/embed/0SJE9dYdpps','<p>Lớp (Class), Kế thừa và Prototypes.</p>',4,600),(20,4,'Bài 5: JS Modules','https://www.youtube.com/embed/0SJE9dYdpps','<p>Sử dụng Import và Export.</p>',5,700),(21,5,'Bài 1: Nguyên lý thị giác','https://www.youtube.com/embed/c9Wg6Cb_YlU','<p>Các nguyên tắc thiết kế UI cơ bản.</p>',1,300),(22,5,'Bài 2: Typography & Color Theory','https://www.youtube.com/embed/c9Wg6Cb_YlU','<p>Lựa chọn font chữ và phối màu.</p>',2,400),(23,5,'Bài 3: Làm quen với Figma','https://www.youtube.com/embed/c9Wg6Cb_YlU','<p>Sử dụng các công cụ thiết kế cơ bản.</p>',3,500),(24,5,'Bài 4: Thiết kế Wireframe','https://www.youtube.com/embed/c9Wg6Cb_YlU','<p>Lên khung bố cục cho website.</p>',4,600),(25,5,'Bài 5: Tạo Prototype','https://www.youtube.com/embed/c9Wg6Cb_YlU','<p>Mô phỏng tương tác người dùng.</p>',5,700),(26,6,'Bài 1: Tổng quan về AI & ML','https://www.youtube.com/embed/Gv9_4yMHFhI','<p>Phân biệt AI, ML và Deep Learning.</p>',1,300),(27,6,'Bài 2: Supervised Learning','https://www.youtube.com/embed/Gv9_4yMHFhI','<p>Học máy có giám sát là gì?</p>',2,400),(28,6,'Bài 3: Unsupervised Learning','https://www.youtube.com/embed/Gv9_4yMHFhI','<p>Phân cụm dữ liệu với học không giám sát.</p>',3,500),(29,6,'Bài 4: Mạng Nơ-ron nhân tạo (ANN)','https://www.youtube.com/embed/Gv9_4yMHFhI','<p>Cấu trúc cơ bản của Neural Networks.</p>',4,600),(30,6,'Bài 5: Đánh giá mô hình (Model Evaluation)','https://www.youtube.com/embed/Gv9_4yMHFhI','<p>Cách kiểm tra độ chính xác của model.</p>',5,700),(31,7,'Bài 1: Cài đặt và Hello World','https://www.youtube.com/embed/zMvr1yZ08D8','<p>Cài đặt Python và chạy mã đầu tiên.</p>',1,300),(32,7,'Bài 2: Biến và Kiểu dữ liệu','https://www.youtube.com/embed/zMvr1yZ08D8','<p>Numbers, Strings, Lists, Dictionaries.</p>',2,400),(33,7,'Bài 3: Câu lệnh rẽ nhánh và Vòng lặp','https://www.youtube.com/embed/zMvr1yZ08D8','<p>Sử dụng if/else, for, while.</p>',3,500),(34,7,'Bài 4: Viết Hàm (Functions)','https://www.youtube.com/embed/zMvr1yZ08D8','<p>Định nghĩa và gọi hàm trong Python.</p>',4,600),(35,7,'Bài 5: Thao tác với File','https://www.youtube.com/embed/zMvr1yZ08D8','<p>Đọc và ghi file .txt, .csv.</p>',5,700),(36,8,'Bài 1: Tư duy Marketing hiện đại','https://www.youtube.com/embed/bixR-KIJKYM','<p>Inbound Marketing vs Outbound Marketing.</p>',1,300),(37,8,'Bài 2: SEO căn bản','https://www.youtube.com/embed/bixR-KIJKYM','<p>Tối ưu hóa website cho Google.</p>',2,400),(38,8,'Bài 3: Tổng quan Facebook Ads','https://www.youtube.com/embed/bixR-KIJKYM','<p>Thiết lập chiến dịch quảng cáo mạng xã hội.</p>',3,500),(39,8,'Bài 4: Google Search Ads','https://www.youtube.com/embed/bixR-KIJKYM','<p>Quảng cáo từ khóa trên Google.</p>',4,600),(40,8,'Bài 5: Đọc chỉ số Analytics','https://www.youtube.com/embed/bixR-KIJKYM','<p>Theo dõi và đánh giá hiệu quả chiến dịch.</p>',5,700),(41,9,'Bài 1: Cấu tạo máy ảnh số','https://www.youtube.com/embed/V7z7BAZdt2M','<p>DSLR vs Mirrorless.</p>',1,300),(42,9,'Bài 2: Tam giác phơi sáng','https://www.youtube.com/embed/V7z7BAZdt2M','<p>ISO, Khẩu độ, Tốc độ màn trập.</p>',2,400),(43,9,'Bài 3: Quy tắc bố cục','https://www.youtube.com/embed/V7z7BAZdt2M','<p>Quy tắc 1/3, đường dẫn hướng.</p>',3,500),(44,9,'Bài 4: Ánh sáng trong nhiếp ảnh','https://www.youtube.com/embed/V7z7BAZdt2M','<p>Ánh sáng tự nhiên và ánh sáng nhân tạo.</p>',4,600),(45,9,'Bài 5: Hậu kỳ với Lightroom','https://www.youtube.com/embed/V7z7BAZdt2M','<p>Chỉnh màu sắc và ánh sáng hậu kỳ.</p>',5,700),(46,10,'Bài 1: Bảng phiên âm IPA','https://www.youtube.com/embed/juKd26qkNAw','<p>Nền tảng phát âm chuẩn.</p>',1,300),(47,10,'Bài 2: Tiếng Anh giao tiếp công sở','https://www.youtube.com/embed/juKd26qkNAw','<p>Các mẫu câu thường dùng trong văn phòng.</p>',2,400),(48,10,'Bài 3: Kỹ năng thuyết trình','https://www.youtube.com/embed/juKd26qkNAw','<p>Cấu trúc một bài Presentation.</p>',3,500),(49,10,'Bài 4: Luyện nghe chủ động','https://www.youtube.com/embed/juKd26qkNAw','<p>Phương pháp nghe chép chính tả.</p>',4,600),(50,10,'Bài 5: Trả lời phỏng vấn tiếng Anh','https://www.youtube.com/embed/juKd26qkNAw','<p>Cách trả lời các câu hỏi tuyển dụng phổ biến.</p>',5,700);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `time_spent_seconds` int DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
INSERT INTO `progress` VALUES (23,4,1,1,100.00,245,'2026-03-19 02:54:08'),(24,4,2,1,100.00,441,'2026-03-19 02:54:08'),(25,4,3,1,100.00,369,'2026-03-19 02:54:08'),(26,4,4,1,100.00,423,'2026-03-19 02:54:08'),(27,4,5,1,100.00,907,'2026-03-19 02:54:08'),(28,4,16,0,6.00,1025,NULL),(29,4,17,0,41.00,411,NULL),(30,4,18,0,30.00,680,NULL),(31,4,19,0,99.00,337,NULL),(32,4,20,0,20.00,390,NULL),(36,11,36,1,100.00,0,'2026-04-02 09:03:19'),(38,11,37,1,100.00,0,'2026-04-02 09:03:24'),(39,11,38,1,100.00,0,'2026-04-02 09:03:28'),(40,11,1,1,100.00,0,'2026-04-02 09:06:03'),(41,11,2,1,100.00,0,'2026-04-02 09:06:10'),(42,11,3,1,100.00,0,'2026-04-06 10:56:30'),(43,11,4,1,100.00,0,'2026-04-06 10:56:33'),(44,11,5,1,100.00,0,'2026-04-06 10:56:35'),(46,11,41,1,100.00,0,'2026-04-08 14:45:31'),(47,11,42,1,100.00,0,'2026-04-08 14:45:33'),(48,11,43,1,100.00,0,'2026-04-17 16:52:25'),(49,11,44,1,100.00,0,'2026-04-17 16:52:28'),(50,11,45,1,100.00,0,'2026-04-17 16:52:30');
/*!40000 ALTER TABLE `progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `content` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_option_question` (`question_id`),
  CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
INSERT INTO `question_options` VALUES (1,1,'Sử dụng Virtual DOM để tăng tốc độ cập nhật UI',1),(2,1,'Là Framework full-stack có sẵn database',0),(3,1,'Bắt buộc phải dùng TypeScript',0),(4,1,'Sử dụng Two-way data binding mặc định',0),(5,2,'npm create vite@latest',1),(6,2,'npm run react-app',0),(7,2,'vite new project',0),(8,2,'create-react-app --fast',0),(9,3,'className',1),(10,3,'class',0),(11,3,'cssClass',0),(12,3,'styleClass',0),(13,4,'Chỉ đọc (Read-only), không thể thay đổi bởi component con',1),(14,4,'Dùng để lưu state nội bộ của Component',0),(15,4,'Thay đổi được thoải mái ở mọi nơi',0),(16,4,'Chỉ truyền được kiểu số (Number)',0),(17,5,'useState',1),(18,5,'useEffect',0),(19,5,'useContext',0),(20,5,'useMemo',0),(21,6,'Sau khi component đã render ra giao diện',1),(22,6,'Trước khi render',0),(23,6,'Trong lúc đang render',0),(24,6,'Chỉ thực thi khi component bị unmount',0),(25,7,'Bắt đầu bằng chữ \"use\" (VD: useFetch)',1),(26,7,'Viết hoa toàn bộ',0),(27,7,'Kết thúc bằng \"Hook\"',0),(28,7,'Không có quy tắc nào',0),(29,8,'Hiện tượng Props drilling (truyền props qua nhiều tầng)',1),(30,8,'Tối ưu tốc độ tải hình ảnh',0),(31,8,'Bảo vệ mã nguồn chống hack',0),(32,8,'Tạo hiệu ứng animation',0),(33,9,'createSlice',1),(34,9,'createReducer',0),(35,9,'createStore',0),(36,9,'useSelector',0),(37,10,'Giảm kích thước file Javascript ban đầu, tăng tốc độ tải trang',1),(38,10,'Làm gọn code CSS',0),(39,10,'Tăng dung lượng database',0),(40,10,'Ngăn chặn tấn công DDoS',0),(41,11,'Event-Driven, Non-blocking I/O',1),(42,11,'Multi-threading (Đa luồng)',0),(43,11,'Synchronous Execution',0),(44,11,'Mô hình MVC',0),(45,12,'express()',1),(46,12,'new Express()',0),(47,12,'createExpress()',0),(48,12,'require(\"app\")',0),(49,13,'mysql2',1),(50,13,'mongoose',0),(51,13,'pg',0),(52,13,'sqlite3',0),(53,14,'POST',1),(54,14,'GET',0),(55,14,'DELETE',0),(56,14,'PATCH',0),(57,15,'3 phần (Header, Payload, Signature)',1),(58,15,'2 phần (Header, Body)',0),(59,15,'1 chuỗi mã hóa duy nhất',0),(60,15,'4 phần rời rạc',0),(61,16,'const',1),(62,16,'let',0),(63,16,'var',0),(64,16,'final',0),(65,17,'document.querySelector()',1),(66,17,'document.querySelectorAll()',0),(67,17,'document.getElementsByClassName()',0),(68,17,'document.getElementsByTagName()',0),(69,18,'Một hàm được định nghĩa bằng từ khóa async',1),(70,18,'Một vòng lặp for thông thường',0),(71,18,'Một class cha',0),(72,18,'Câu lệnh if/else',0),(73,19,'constructor',1),(74,19,'init',0),(75,19,'start',0),(76,19,'main',0),(77,20,'import TenHam from \"./module.js\"',1),(78,20,'import { TenHam } from \"./module.js\"',0),(79,20,'require(\"./module.js\")',0),(80,20,'include \"./module.js\"',0),(81,21,'Giảm tải nhận thức, giúp mắt nghỉ ngơi và tập trung vào nội dung chính',1),(82,21,'Để trang web có vẻ dài hơn',0),(83,21,'Tiết kiệm màu mực in',0),(84,21,'Là lỗi thiết kế bị thiếu nội dung',0),(85,22,'RGB',1),(86,22,'CMYK',0),(87,22,'Pantone',0),(88,22,'Grayscale',0),(89,23,'Phím F',1),(90,23,'Phím V',0),(91,23,'Phím R',0),(92,23,'Phím T',0),(93,24,'Bản vẽ phác thảo cấu trúc giao diện cơ bản (thường đen trắng)',1),(94,24,'Bản thiết kế cuối cùng đầy đủ màu sắc',0),(95,24,'Công cụ lập trình CSS',0),(96,24,'Một loại font chữ',0),(97,25,'Tạo các luồng click chuyển trang mô phỏng như ứng dụng thật',1),(98,25,'Sinh ra code frontend tự động',0),(99,25,'Kiểm tra lỗi chính tả nội dung',0),(100,25,'Upload thiết kế lên server',0),(101,26,'Hệ thống tự động học và cải thiện từ dữ liệu thay vì lập trình cụ thể',1),(102,26,'Lập trình các lệnh if-else phức tạp',0),(103,26,'Phần mềm tự động tạo video',0),(104,26,'Một loại vi xử lý máy tính',0),(105,27,'Dữ liệu đã được gán nhãn (Labeled data)',1),(106,27,'Dữ liệu chưa phân loại',0),(107,27,'Dữ liệu hình ảnh độ phân giải cao',0),(108,27,'Chỉ chấp nhận dữ liệu text',0),(109,28,'Unsupervised Learning (Học không giám sát)',1),(110,28,'Supervised Learning',0),(111,28,'Reinforcement Learning',0),(112,28,'Deep Learning',0),(113,29,'Hidden Layer (Lớp ẩn)',1),(114,29,'Database Layer',0),(115,29,'Logic Layer',0),(116,29,'Action Layer',0),(117,30,'Tỷ lệ số lượt dự đoán đúng trên tổng số dự đoán',1),(118,30,'Thời gian máy tính chạy xong mô hình',0),(119,30,'Số lỗi hệ thống trả về',0),(120,30,'Dung lượng file data',0),(121,31,'print()',1),(122,31,'echo()',0),(123,31,'console.log()',0),(124,31,'System.out.println()',0),(125,32,'Dictionary',1),(126,32,'List',0),(127,32,'Tuple',0),(128,32,'Set',0),(129,33,'break',1),(130,33,'stop',0),(131,33,'exit',0),(132,33,'continue',0),(133,34,'def',1),(134,34,'function',0),(135,34,'func',0),(136,34,'define',0),(137,35,'Mode \"a\" (Append)',1),(138,35,'Mode \"w\" (Write)',0),(139,35,'Mode \"r\" (Read)',0),(140,35,'Mode \"x\" (Create)',0),(141,36,'Thu hút khách hàng tự nhiên bằng nội dung hữu ích và trải nghiệm cá nhân hóa',1),(142,36,'Gọi điện thoại (Telesales) cho hàng ngàn người',0),(143,36,'Gửi email spam liên tục',0),(144,36,'Mua danh sách số điện thoại để nhắn tin',0),(145,37,'Thẻ <title> (Tiêu đề trang)',1),(146,37,'Thẻ <div>',0),(147,37,'Thẻ <br>',0),(148,37,'Thẻ <button>',0),(149,38,'Facebook Pixel (Meta Pixel)',1),(150,38,'Google Search Console',0),(151,38,'Facebook Ads Manager',0),(152,38,'Facebook Insights',0),(153,39,'Tỷ lệ nhấp chuột (Số click / Số lượt hiển thị x 100)',1),(154,39,'Chi phí trả cho một lượt click',0),(155,39,'Tổng số tiền đã tiêu',0),(156,39,'Số người mua hàng thành công',0),(157,40,'Khách hàng truy cập và rời đi ngay từ trang đầu mà không tương tác thêm',1),(158,40,'Khách hàng ở lại trang rất lâu',0),(159,40,'Trang web bị lỗi không truy cập được',0),(160,40,'Tốc độ load trang cực kỳ nhanh',0),(161,41,'Không có hệ thống gương lật bên trong',1),(162,41,'Không thể thay đổi ống kính (lens)',0),(163,41,'Chụp hình mờ hơn DSLR',0),(164,41,'Sử dụng phim cuộn thay vì cảm biến',0),(165,42,'ISO, Khẩu độ (Aperture), Tốc độ màn trập (Shutter Speed)',1),(166,42,'Zoom, Focus, Flash',0),(167,42,'Tương phản, Bão hòa, Sắc độ',0),(168,42,'Megapixel, Bitrate, Framerate',0),(169,43,'9 phần bằng nhau',1),(170,43,'3 phần bằng nhau',0),(171,43,'6 phần bằng nhau',0),(172,43,'4 phần bằng nhau',0),(173,44,'Sau khi mặt trời mọc hoặc ngay trước lúc hoàng hôn',1),(174,44,'Giữa trưa lúc 12 giờ',0),(175,44,'Hoàn toàn tối vào ban đêm',0),(176,44,'Khi ở trong studio tối',0),(177,45,'Chỉnh độ sáng/tối tổng thể của bức ảnh',1),(178,45,'Xóa phông nền bức ảnh',0),(179,45,'Chuyển ảnh màu sang đen trắng',0),(180,45,'Tăng độ nét vùng viền',0),(181,46,'44 âm (20 nguyên âm, 24 phụ âm)',1),(182,46,'26 chữ cái',0),(183,46,'5 nguyên âm chính',0),(184,46,'32 âm',0),(185,47,'As Soon As Possible (Càng sớm càng tốt)',1),(186,47,'As Simple As Possible',0),(187,47,'Always Send A Picture',0),(188,47,'A Short And Polite',0),(189,48,'Thu hút sự chú ý của người nghe ngay từ những giây đầu tiên',1),(190,48,'Tóm tắt toàn bộ nội dung bài ở cuối',0),(191,48,'Hỏi đáp với khán giả (Q&A)',0),(192,48,'Lời chào tạm biệt',0),(193,49,'Nghe người bản xứ nói và lập tức lặp lại ngay theo đúng ngữ điệu đó',1),(194,49,'Dịch từng từ tiếng Anh sang tiếng Việt trong đầu',0),(195,49,'Học thuộc lòng từ vựng bằng cách chép tay',0),(196,49,'Nghe podcast trong lúc ngủ',0),(197,50,'Tóm gọn chuyên môn, kinh nghiệm và kỹ năng liên quan trực tiếp đến công việc',1),(198,50,'Kể chi tiết về quê quán và sở thích du lịch cá nhân',0),(199,50,'Đọc lại y hệt từng chữ có trên CV',0),(200,50,'Hỏi ngược lại nhà tuyển dụng về mức lương',0);
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `content` text NOT NULL,
  `question_type` enum('multiple_choice','true_false') NOT NULL DEFAULT 'multiple_choice',
  `score` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_question_quiz` (`quiz_id`),
  CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'Đặc điểm nổi bật nhất của ReactJS là gì?','multiple_choice',100),(2,11,'Lệnh nào dùng để khởi tạo dự án React mới với Vite?','multiple_choice',100),(3,12,'Trong JSX, thuộc tính class của HTML phải được viết thành gì?','multiple_choice',100),(4,13,'Đặc điểm chính của Props trong React là gì?','multiple_choice',100),(5,14,'Hook nào sau đây dùng để khai báo biến trạng thái (state) trong Functional Component?','multiple_choice',100),(6,2,'Hook useEffect thường được thực thi vào thời điểm nào?','multiple_choice',100),(7,15,'Quy tắc đặt tên bắt buộc cho một Custom Hook là gì?','multiple_choice',100),(8,16,'Context API trong React được sinh ra để giải quyết vấn đề chính nào?','multiple_choice',100),(9,17,'Hàm nào của Redux Toolkit dùng để tạo một slice chứa reducers và actions?','multiple_choice',100),(10,18,'Kỹ thuật Code Splitting và Lazy Loading trong React giúp ích gì?','multiple_choice',100),(11,3,'Node.js hoạt động dựa trên mô hình xử lý nào?','multiple_choice',100),(12,19,'Hàm nào dùng để khởi tạo một ứng dụng web với ExpressJS?','multiple_choice',100),(13,20,'Package nào phổ biến để kết nối Node.js với MySQL có hỗ trợ cú pháp Promises?','multiple_choice',100),(14,21,'HTTP Method nào theo chuẩn RESTful thường dùng để tạo mới tài nguyên?','multiple_choice',100),(15,22,'JSON Web Token (JWT) được cấu tạo từ mấy phần chính?','multiple_choice',100),(16,4,'Từ khóa nào trong ES6 dùng để khai báo một hằng số?','multiple_choice',100),(17,23,'Phương thức nào sau đây chỉ lấy ra đúng MỘT phần tử DOM đầu tiên thỏa mãn CSS Selector?','multiple_choice',100),(18,24,'Từ khóa \"await\" trong JavaScript chỉ có thể được sử dụng bên trong?','multiple_choice',100),(19,25,'Phương thức khởi tạo đối tượng của một Class trong JS có tên là gì?','multiple_choice',100),(20,26,'Để nhập một hàm được \"export default\" từ module khác, ta dùng cú pháp nào?','multiple_choice',100),(21,5,'Trong thiết kế UI, White Space (Khoảng trắng) có tác dụng gì?','multiple_choice',100),(22,27,'Hệ màu nào tiêu chuẩn dùng cho các thiết kế hiển thị trên màn hình số (Digital)?','multiple_choice',100),(23,28,'Phím tắt để vẽ một Frame mới trong Figma là gì?','multiple_choice',100),(24,29,'Wireframe trong quy trình thiết kế là gì?','multiple_choice',100),(25,30,'Chức năng Prototype trong Figma có ý nghĩa gì?','multiple_choice',100),(26,6,'Machine Learning (Học máy) là gì?','multiple_choice',100),(27,31,'Supervised Learning (Học có giám sát) yêu cầu dữ liệu đầu vào phải có đặc điểm gì?','multiple_choice',100),(28,32,'K-Means Clustering thuộc nhánh nào của Machine Learning?','multiple_choice',100),(29,33,'Trong Mạng Nơ-ron (ANN), lớp nằm giữa Input và Output được gọi là gì?','multiple_choice',100),(30,34,'Chỉ số Accuracy (Độ chính xác) của mô hình được tính như thế nào?','multiple_choice',100),(31,7,'Hàm nào trong Python dùng để in văn bản ra màn hình console?','multiple_choice',100),(32,35,'Cấu trúc dữ liệu nào trong Python hoạt động theo cơ chế Key-Value?','multiple_choice',100),(33,36,'Lệnh nào dùng để thoát hoàn toàn khỏi vòng lặp \"for\" hoặc \"while\"?','multiple_choice',100),(34,37,'Từ khóa nào được sử dụng để định nghĩa một hàm tự tạo trong Python?','multiple_choice',100),(35,38,'Mode nào mở file để GHI THÊM vào cuối file mà không xóa dữ liệu cũ?','multiple_choice',100),(36,8,'Inbound Marketing tập trung vào chiến lược nào?','multiple_choice',100),(37,39,'Trong SEO On-page, thẻ HTML nào quan trọng nhất để mô tả nội dung chính trang web?','multiple_choice',100),(38,40,'Đoạn mã dùng để theo dõi hành vi người dùng trên website gửi về Facebook gọi là gì?','multiple_choice',100),(39,41,'Chỉ số CTR (Click-Through Rate) trong quảng cáo biểu thị điều gì?','multiple_choice',100),(40,42,'Bounce Rate (Tỷ lệ thoát) cao trong Google Analytics thường phản ánh điều gì?','multiple_choice',100),(41,9,'Điểm khác biệt lớn nhất về cấu tạo giữa máy ảnh Mirrorless và DSLR là gì?','multiple_choice',100),(42,43,'Tam giác phơi sáng (Exposure Triangle) bao gồm 3 yếu tố nào?','multiple_choice',100),(43,44,'Quy tắc bố cục 1/3 (Rule of Thirds) chia khung hình ra làm bao nhiêu ô bằng nhau?','multiple_choice',100),(44,45,'Khái niệm \"Giờ Vàng\" (Golden Hour) chỉ thời điểm nào trong ngày?','multiple_choice',100),(45,46,'Thanh công cụ \"Exposure\" trong phần mềm Lightroom dùng để làm gì?','multiple_choice',100),(46,10,'Bảng phiên âm quốc tế (IPA) trong tiếng Anh có tổng cộng bao nhiêu âm?','multiple_choice',100),(47,47,'Trong văn hóa gửi email công sở, \"ASAP\" là viết tắt của cụm từ nào?','multiple_choice',100),(48,48,'Phần \"Hook\" trong cấu trúc một bài thuyết trình nhằm mục đích gì?','multiple_choice',100),(49,49,'Kỹ thuật \"Shadowing\" trong việc luyện nghe nói tiếng Anh là gì?','multiple_choice',100),(50,50,'Khi phỏng vấn, câu trả lời tốt nhất cho \"Tell me about yourself\" nên tập trung vào đâu?','multiple_choice',100);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `total_score` int DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_quiz_lesson` (`lesson_id`),
  CONSTRAINT `fk_quiz_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,1,'Quiz: React for Beginners - Bài 1',100,'2026-04-02 04:17:37'),(2,6,'Quiz: Advanced React - Bài 1',100,'2026-04-02 04:17:37'),(3,11,'Quiz: Node.js API - Bài 1',100,'2026-04-02 04:17:37'),(4,16,'Quiz: JavaScript Masterclass - Bài 1',100,'2026-04-02 04:17:37'),(5,21,'Quiz: UI UX Design - Bài 1',100,'2026-04-02 04:17:37'),(6,26,'Quiz: Machine Learning Intro - Bài 1',100,'2026-04-02 04:17:37'),(7,31,'Quiz: Python for Beginners - Bài 1',100,'2026-04-02 04:17:37'),(8,36,'Quiz: Digital Marketing 101 - Bài 1',100,'2026-04-02 04:17:37'),(9,41,'Quiz: Photography Basics - Bài 1',100,'2026-04-02 04:17:37'),(10,46,'Quiz: English Speaking - Bài 1',100,'2026-04-02 04:17:37'),(11,2,'Quiz: Bài 2: Cài đặt môi trường (Node.js & Vite)',100,'2026-04-18 05:44:02'),(12,3,'Quiz: Bài 3: Cú pháp JSX cơ bản',100,'2026-04-18 05:44:02'),(13,4,'Quiz: Bài 4: Component & Props',100,'2026-04-18 05:44:02'),(14,5,'Quiz: Bài 5: State & Lifecycle',100,'2026-04-18 05:44:02'),(15,7,'Quiz: Bài 2: Tự xây dựng Custom Hooks',100,'2026-04-18 05:44:02'),(16,8,'Quiz: Bài 3: Quản lý State với Context API',100,'2026-04-18 05:44:02'),(17,9,'Quiz: Bài 4: Tích hợp Redux Toolkit',100,'2026-04-18 05:44:02'),(18,10,'Quiz: Bài 5: Tối ưu hiệu suất (Code Splitting)',100,'2026-04-18 05:44:02'),(19,12,'Quiz: Bài 2: ExpressJS Basics',100,'2026-04-18 05:44:02'),(20,13,'Quiz: Bài 3: Kết nối MySQL',100,'2026-04-18 05:44:02'),(21,14,'Quiz: Bài 4: Thiết kế RESTful API',100,'2026-04-18 05:44:02'),(22,15,'Quiz: Bài 5: JWT Authentication',100,'2026-04-18 05:44:02'),(23,17,'Quiz: Bài 2: Thao tác DOM (DOM Manipulation)',100,'2026-04-18 05:44:02'),(24,18,'Quiz: Bài 3: Lập trình bất đồng bộ',100,'2026-04-18 05:44:02'),(25,19,'Quiz: Bài 4: OOP trong JavaScript',100,'2026-04-18 05:44:02'),(26,20,'Quiz: Bài 5: JS Modules',100,'2026-04-18 05:44:02'),(27,22,'Quiz: Bài 2: Typography & Color Theory',100,'2026-04-18 05:44:02'),(28,23,'Quiz: Bài 3: Làm quen với Figma',100,'2026-04-18 05:44:02'),(29,24,'Quiz: Bài 4: Thiết kế Wireframe',100,'2026-04-18 05:44:02'),(30,25,'Quiz: Bài 5: Tạo Prototype',100,'2026-04-18 05:44:02'),(31,27,'Quiz: Bài 2: Supervised Learning',100,'2026-04-18 05:44:02'),(32,28,'Quiz: Bài 3: Unsupervised Learning',100,'2026-04-18 05:44:02'),(33,29,'Quiz: Bài 4: Mạng Nơ-ron nhân tạo (ANN)',100,'2026-04-18 05:44:02'),(34,30,'Quiz: Bài 5: Đánh giá mô hình (Model Evaluation)',100,'2026-04-18 05:44:02'),(35,32,'Quiz: Bài 2: Biến và Kiểu dữ liệu',100,'2026-04-18 05:44:02'),(36,33,'Quiz: Bài 3: Câu lệnh rẽ nhánh và Vòng lặp',100,'2026-04-18 05:44:02'),(37,34,'Quiz: Bài 4: Viết Hàm (Functions)',100,'2026-04-18 05:44:02'),(38,35,'Quiz: Bài 5: Thao tác với File',100,'2026-04-18 05:44:02'),(39,37,'Quiz: Bài 2: SEO căn bản',100,'2026-04-18 05:44:02'),(40,38,'Quiz: Bài 3: Tổng quan Facebook Ads',100,'2026-04-18 05:44:02'),(41,39,'Quiz: Bài 4: Google Search Ads',100,'2026-04-18 05:44:02'),(42,40,'Quiz: Bài 5: Đọc chỉ số Analytics',100,'2026-04-18 05:44:02'),(43,42,'Quiz: Bài 2: Tam giác phơi sáng',100,'2026-04-18 05:44:02'),(44,43,'Quiz: Bài 3: Quy tắc bố cục',100,'2026-04-18 05:44:02'),(45,44,'Quiz: Bài 4: Ánh sáng trong nhiếp ảnh',100,'2026-04-18 05:44:02'),(46,45,'Quiz: Bài 5: Hậu kỳ với Lightroom',100,'2026-04-18 05:44:02'),(47,47,'Quiz: Bài 2: Tiếng Anh giao tiếp công sở',100,'2026-04-18 05:44:02'),(48,48,'Quiz: Bài 3: Kỹ năng thuyết trình',100,'2026-04-18 05:44:02'),(49,49,'Quiz: Bài 4: Luyện nghe chủ động',100,'2026-04-18 05:44:02'),(50,50,'Quiz: Bài 5: Trả lời phỏng vấn tiếng Anh',100,'2026-04-18 05:44:02');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (4,'Backend'),(3,'Frontend'),(2,'Node.js'),(6,'Python'),(1,'React'),(5,'UI/UX');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_trans_user` (`user_id`),
  CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,11,500000.00,'pending','LMS1776344271428','2026-04-16 12:57:51'),(2,11,100000.00,'pending','LMS1776350870984','2026-04-16 14:47:50'),(3,11,200000.00,'completed','LMS1776403884661','2026-04-17 05:31:24'),(4,11,200000.00,'completed','LMS1776404231729','2026-04-17 05:37:11'),(5,11,100000.00,'pending','LMS1776404308935','2026-04-17 05:38:28'),(6,11,200000.00,'completed','LMS1776409607471','2026-04-17 07:06:47'),(7,11,200000.00,'failed','LMS1776409777487','2026-04-17 07:09:37'),(8,11,100000.00,'failed','LMS1776413822743','2026-04-17 08:17:02'),(9,11,100000.00,'pending','LMS1776414013367','2026-04-17 08:20:13'),(10,11,100000.00,'pending','LMS1776414029493','2026-04-17 08:20:29'),(11,11,500000.00,'pending','LMS1776414050854','2026-04-17 08:20:50'),(12,11,100000.00,'failed','LMS1776414130336','2026-04-17 08:22:10'),(13,11,200000.00,'completed','LMS1776414312932','2026-04-17 08:25:12'),(14,11,100000.00,'failed','LMS1776424963223','2026-04-17 11:22:43'),(15,12,500000.00,'completed','LMS1776443953933','2026-04-17 16:39:13'),(16,12,1000000.00,'completed','LMS1776444006398','2026-04-17 16:40:06'),(17,12,1250000.00,'completed','course_purchase','2026-04-17 16:40:32'),(18,11,500000.00,'completed','LMS1776473809752','2026-04-18 00:56:49'),(19,11,1250000.00,'completed','course_purchase','2026-04-18 00:57:27'),(20,11,500000.00,'failed','LMS1776478199298','2026-04-18 02:09:59'),(21,11,500000.00,'failed','LMS1776478530857','2026-04-18 02:15:30'),(22,11,500000.00,'pending','LMS1776478540631','2026-04-18 02:15:40'),(23,11,200000.00,'failed','LMS1776489646321','2026-04-18 05:20:46'),(24,11,200000.00,'completed','LMS1776490140381','2026-04-18 05:29:00'),(25,11,1000000.00,'completed','LMS1776492072306','2026-04-18 06:01:12'),(26,11,100000.00,'failed','LMS1777128817313','2026-04-25 14:53:37');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `learning_goal` text,
  `current_level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `preferred_learning_style` varchar(100) DEFAULT NULL,
  `daily_study_time` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_profile` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,4,'Muốn trở thành Frontend Developer chuyên nghiệp','beginner','visual',120),(2,11,'Học làm API và hệ thống Backend','intermediate','practice',90);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_quiz_results`
--

DROP TABLE IF EXISTS `user_quiz_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_quiz_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `score` float NOT NULL,
  `taken_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_result_user` (`user_id`),
  KEY `fk_result_quiz` (`quiz_id`),
  CONSTRAINT `fk_result_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_result_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_quiz_results`
--

LOCK TABLES `user_quiz_results` WRITE;
/*!40000 ALTER TABLE `user_quiz_results` DISABLE KEYS */;
INSERT INTO `user_quiz_results` VALUES (1,11,1,0,'2026-04-06 10:56:10'),(2,11,1,100,'2026-04-06 10:56:18'),(3,11,8,100,'2026-04-06 10:57:32'),(4,11,9,0,'2026-04-08 14:45:57'),(5,11,9,100,'2026-04-08 14:46:03');
/*!40000 ALTER TABLE `user_quiz_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `balance` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@test.com','$2b$10$eok0EzP9YpMbZ0KjcTXZUO97HzVSIGI4gKE.qRK5P8zWAX/Oor7EO','admin',NULL,'2026-03-08 08:18:14','2026-03-17 03:23:06',0.00),(2,'Teacher John','john@test.com','$2b$10$ibJlu7ctu11EhPiR29diQu1o9TdkWmKgoEYVaRaoBN3oZbEvCMyL.','teacher',NULL,'2026-03-08 08:18:14','2026-03-17 03:23:06',0.00),(3,'Teacher Anna','anna@test.com','$2b$10$4hb6jzefy97aelqEG5nZ4OjNiCsskPH5vTfCyMN5V/2l.aUvi377a','teacher',NULL,'2026-03-08 08:18:14','2026-03-17 03:23:06',0.00),(4,'Student Mike','mike@test.com','$2b$10$s3d1tzXsP0S0NubObZ8qSeuFdA3MBYt0u.qQN35lTgAgG1H2EB8fW','student',NULL,'2026-03-08 08:18:14','2026-03-17 03:23:06',0.00),(5,'Student Sarah','sarah@test.com','$2b$10$Sjnq8fB25ggyQ.h3PEDc5evLYYTCcqej6ir.EXHuNRWp2BRBQ/icO','student',NULL,'2026-03-08 08:18:14','2026-03-17 03:23:06',0.00),(6,'Student David','david@test.com','$2b$10$zNjPB7aIRdXiMzzLNXABOuTAQik7YJ2u866vRPFdpA8/1d2tVD/KS','student',NULL,'2026-03-08 08:22:52','2026-03-17 03:23:06',0.00),(7,'Student Emma','emma@test.com','$2b$10$7YoiNQu2TwiMsRhKjM75GeeUVcdeEjUjk20T.rT8U.SDKzdaaK.sq','student',NULL,'2026-03-08 08:22:52','2026-03-17 03:23:06',0.00),(8,'Student Alex','alex@test.com','$2b$10$hxVMXf7YkUngN52M73Fp/ewUfgPpfd23n0zT/KtxVGrnlipfkVnW2','student',NULL,'2026-03-08 08:22:52','2026-03-17 03:23:06',0.00),(9,'Student Linda','linda@test.com','$2b$10$IUZ86xj2c1K1UKBRSaVvYe2iWS3UNWAwcTOieRfrvggsKzAKUMz5S','student',NULL,'2026-03-08 08:22:52','2026-03-17 03:23:06',0.00),(10,'Student Tom','tom@test.com','$2b$10$RKaxavhIpZjJJK3up6o4YOMmo5m20P1uUokL86rWNL5977VN9daOi','student',NULL,'2026-03-08 08:22:52','2026-03-17 03:23:06',0.00),(11,'Huy Trịnh','huytrinhsp19@gmail.com','$2b$10$lvllbFxv6CMboe3SB45G7.nqUglvRaqnAFFTgGHHEJ93hCfLn01Kq','student',NULL,'2026-03-12 10:24:26','2026-04-18 06:01:33',1250000.00),(12,'aaa','huytrinh19604@gmail.com','$2b$10$SNh8Rd901eOyeZl4KMTA5ugyOSoAhIUXeUPZVYHxVnekz3gpPhSje','student',NULL,'2026-03-12 10:36:19','2026-04-17 16:40:32',250000.00),(13,'abc','huytrinhsp191@gmail.com','$2b$10$4VDazGU1EbBx3TN/oVQw9ec9VWodod8C5UV7hYGKuSlWf46sxtwy6','student',NULL,'2026-03-13 12:56:11','2026-03-17 03:23:06',0.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25 22:36:56
