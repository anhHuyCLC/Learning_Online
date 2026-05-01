import connectDB from '../../config/db';

export class FeatureExtractionService {
    async runExtraction() {
        const db = await connectDB();
        
        console.log("Bắt đầu trích xuất đặc trưng khóa học (Course Features)...");
        // Lấy danh sách khóa học kèm danh mục
        const [courses]: any = await db.execute(`
            SELECT c.*, cat.name as category_name
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
        `);

        // Lấy tổng số lượt đăng ký để tính độ phổ biến
        const [totalEnrollmentsResult]: any = await db.execute(`SELECT COUNT(*) as total FROM enrollments`);
        const totalEnrollments = totalEnrollmentsResult[0].total || 1;

        for (const course of courses) {
            const courseId = course.id;
            
            const [enrolls]: any = await db.execute(`SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?`, [courseId]);
            const enrollCount = enrolls[0].count;
            
            // 1. Tính độ phổ biến (0 đến 1)
            const popularityScore = Math.min(1, enrollCount / totalEnrollments);
            
            // 2. Tính tỷ lệ hoàn thành
            const [completedEnrolls]: any = await db.execute(`SELECT COUNT(*) as count FROM enrollments WHERE course_id = ? AND status = 'completed'`, [courseId]);
            const completedCount = completedEnrolls[0].count;
            const completionRate = enrollCount > 0 ? (completedCount / enrollCount) : 0.5;

            // 3. Vector danh mục & kỹ năng
            const categoryName = course.category_name ? course.category_name.toLowerCase() : 'other';
            const categoryVector = { [categoryName]: 1 };
            const skillVector = {
                'programming': categoryName.includes('lập trình') || categoryName.includes('code') ? 0.9 : 0.1,
                'design': categoryName.includes('thiết kế') || categoryName.includes('design') ? 0.9 : 0.1,
                'business': categoryName.includes('kinh doanh') || categoryName.includes('business') ? 0.9 : 0.1,
            };

            // 4. Tính độ mới (tính bằng ngày)
            const recencyDays = Math.floor((Date.now() - new Date(course.created_at).getTime()) / (1000 * 60 * 60 * 24));

            // Lưu vào bảng course_features
            await db.execute(`
                REPLACE INTO course_features 
                (course_id, difficulty_level, avg_rating, completion_rate, popularity_score, recency_days, avg_completion_time, skill_vector, category_vector)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                courseId, 2, 4.5, completionRate, popularityScore, recencyDays, 10.0, 
                JSON.stringify(skillVector), JSON.stringify(categoryVector)
            ]);
        }
        console.log(`✅ Đã cập nhật xong ${courses.length} khóa học.`);

        console.log("Bắt đầu trích xuất đặc trưng học viên (User Features)...");
        const [users]: any = await db.execute(`SELECT id FROM users WHERE role = 'student'`);
        
        for (const user of users) {
            const userId = user.id;

            const [enrolls]: any = await db.execute(`
                SELECT e.course_id, e.status, cat.name as category_name 
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN categories cat ON c.category_id = cat.id
                WHERE e.user_id = ?
            `, [userId]);

            // 1. Cấp độ học tập
            const coursesCompleted = enrolls.filter((e: any) => e.status === 'completed').length;
            const learningLevel = coursesCompleted > 5 ? 3 : (coursesCompleted > 2 ? 2 : 1);
            
            // 2. Sở thích danh mục (Dựa trên những khóa đã học)
            const categoryVector: any = {};
            enrolls.forEach((e: any) => {
                const catName = e.category_name ? e.category_name.toLowerCase() : 'other';
                categoryVector[catName] = (categoryVector[catName] || 0) + 1;
            });
            const totalCats = Object.values(categoryVector).reduce((a: any, b: any) => a + b, 0) as number;
            for (const key in categoryVector) {
                categoryVector[key] = categoryVector[key] / totalCats; // Chuẩn hóa về 0-1
            }

            // 3. Điểm tương tác (Đăng ký càng nhiều điểm càng cao)
            const engagementScore = Math.min(100, enrolls.length * 15);

            await db.execute(`
                REPLACE INTO user_features
                (user_id, learning_level, courses_completed, avg_difficulty, avg_progress, engagement_score, skill_vector, category_vector)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [userId, learningLevel, coursesCompleted, 2.0, 50.0, engagementScore, JSON.stringify({}), JSON.stringify(categoryVector)]);
        }
        console.log(`✅ Đã cập nhật xong ${users.length} học viên.`);
    }
}