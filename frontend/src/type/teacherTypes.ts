import type { Courses } from './coursesType';

export interface TeacherCourse extends Courses {
    created_at: string;
    enrollment_count: number; 
}

export interface CourseStudent {
  id: number;
  name: string;
  email: string;
  enrolled_at: string;
  progress: number;
  status: 'active' | 'completed';
}