export type Courses = {
  id: number;
  name: string;
  price: number;
  title: string;
  image: string;
  teacher_name: string;
  description: string;
  detail_description?: string;
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

