import type { Courses } from './coursesType';

// Extends the base Course type with teacher-specific fields
export interface TeacherCourse extends Courses {
    created_at: string;
    enrollment_count: number; // Number of students enrolled
}

// Type for a student within a teacher's course
export interface CourseStudent {
  id: number;
  name: string;
  email: string;
  enrolled_at: string;
  progress: number;
  status: 'active' | 'completed';
}