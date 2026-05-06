export type Lesson = {
  id: number;
  title: string;
  lesson_order: number;
  has_quiz: boolean;
  video_url?: string;
  content?: string;
};

export type Courses = {
  id: number;
  price: number;
  title: string;
  image: string;
  duration: number;
  teacher_name: string;
  description: string;
  detail_description?: string;
  category_id: number;
  teacher_id: number;
  student_count?: number;
  avg_rating?: string;
  review_count?: number;
  reviews?: any[];
  lessons?: Lesson[];
};

export type Enrollment = {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  course_name: string;
  course_description: string;
  course_price: number;
  course_image: string;
  teacher_id: number;
  teacher_name: string;
};

export type EnrollmentCheck = {
  isEnrolled: boolean;
  enrollment?: Enrollment | null;
};

