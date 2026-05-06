import { getCommentsByLesson, createComment, getPendingQuestions, getCommentById, deleteComment } from '../models/commentModel';

export const getLessonComments = async (req: any, res: any) => {
    try {
        const { id } = req.params; // lessonId
        const comments: any[] = await getCommentsByLesson(Number(id));
        
        const commentMap = new Map();
        const rootComments: any[] = [];

        // Khởi tạo mảng replies cho mỗi comment
        comments.forEach((c) => {
            c.replies = [];
            commentMap.set(c.id, c);
        });

        // Phân loại câu hỏi gốc và câu trả lời
        comments.forEach((c) => {
            if (c.parent_id) {
                const parent = commentMap.get(c.parent_id);
                if (parent) parent.replies.push(c);
            } else {
                rootComments.push(c);
            }
        });

        res.status(200).json({ success: true, comments: rootComments });
    } catch (error) {
        console.error("Lỗi getLessonComments:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const removeComment = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const role = req.user?.role;

        const comment = await getCommentById(Number(id));
        if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });

        if (comment.user_id !== userId && role !== 'teacher' && role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xóa bình luận này' });
        }

        await deleteComment(Number(id));
        res.status(200).json({ success: true, message: 'Đã xóa bình luận' });
    } catch (error) {
        console.error("Lỗi removeComment:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const postLessonComment = async (req: any, res: any) => {
    try {
        const { id } = req.params; // lessonId
        const { content, parent_id } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Yêu cầu xác thực' });
        if (!content) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });

        const newCommentId = await createComment(Number(id), userId, parent_id || null, content);
        
        res.status(201).json({ success: true, message: 'Đã gửi bình luận', commentId: newCommentId });
    } catch (error) {
        console.error("Lỗi postLessonComment:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const getTeacherPendingQuestions = async (req: any, res: any) => {
    try {
        const teacherId = req.user?.id;
        if (!teacherId) return res.status(401).json({ success: false, message: 'Yêu cầu xác thực' });

        const questions = await getPendingQuestions(teacherId);
        res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error("Lỗi getTeacherPendingQuestions:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};