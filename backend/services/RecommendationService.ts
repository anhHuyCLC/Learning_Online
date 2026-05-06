import  db  from "../config/db";

interface QuizResult {
  userId: number;
  quizId: number;
  score: number;
  totalScore: number;
}

export class RecommendationService {
  
  public async processRecommendation(result: QuizResult): Promise<void> {
    const { userId, quizId, score, totalScore } = result;
    const percentage = (score / totalScore) * 100;
    const PASSING_THRESHOLD = 80; 
    try {
      const connection = await db();
      const [rows]: any = await connection.query(
        "SELECT s.id, s.name, c.id as course_id FROM skills s " +
        "JOIN lessons l ON l.skill_id = s.id " +
        "JOIN quizzes q ON q.lesson_id = l.id " +
        "JOIN courses c ON l.course_id = c.id " +
        "WHERE q.id = ?", [quizId]
      );
      const skillInfo = rows[0];

      if (!skillInfo) return;

      if (percentage >= PASSING_THRESHOLD) {
        await this.updateUserSkill(userId, skillInfo.id, 'mastered');
        await this.generateNextLevelPath(userId, skillInfo.id, skillInfo.course_id);
      } 
      else if (percentage >= 50 && percentage < PASSING_THRESHOLD) {
        await this.updateUserSkill(userId, skillInfo.id, 'learning');
        await this.addReviewPath(userId, skillInfo.course_id, "Bạn cần củng cố thêm kiến thức phần này");
      }
      else {
        await this.addReviewPath(userId, skillInfo.course_id, "Điểm số quá thấp, hãy xem lại bài giảng cũ");
      }
   
      await this.logAIAction(userId, result, percentage);

    } catch (error) {
      console.error("Lỗi thực thi Recommendation AI:", error);
    }
  }

  private async generateNextLevelPath(userId: number, skillId: number, currentCourseId: number) {
    const connection = await db();
    const [rows]: any = await connection.query(
      "SELECT id, title FROM courses WHERE category_id = " +
      "(SELECT category_id FROM courses WHERE id = ?) " +
      "AND id != ? ORDER BY price DESC LIMIT 1", 
      [currentCourseId, currentCourseId]
    );
    const nextCourse = rows[0];

    if (nextCourse) {
      await connection.query(
        "INSERT INTO learning_paths (user_id, course_id, recommended_reason, generated_by) " +
        "VALUES (?, ?, ?, 'AI')",
        [userId, nextCourse.id, `Bạn đã xuất sắc vượt qua bài kiểm tra kỹ năng ${skillId}. Hãy thử sức với: ${nextCourse.title}`]
      );
    }
  }

  private async updateUserSkill(userId: number, skillId: number, status: string) {
    const connection = await db();
    await connection.query(
      "INSERT INTO user_skills_log (user_id, skill_id, status) VALUES (?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE status = ?",
      [userId, skillId, status, status]
    );
  }

  private async logAIAction(userId: number, input: any, output: number) {
    const connection = await db();
    await connection.query(
      "INSERT INTO ai_logs (user_id, input_context, recommended_output) VALUES (?, ?, ?)",
      [userId, JSON.stringify(input), JSON.stringify({ score_percentage: output })]
    );
  }

  private async addReviewPath(userId: number, courseId: number, reason: string) {
    const connection = await db();
    await connection.query(
      "INSERT INTO learning_paths (user_id, course_id, recommended_reason, generated_by) " +
      "VALUES (?, ?, ?, 'AI')",
      [userId, courseId, reason]
    );
  }
}