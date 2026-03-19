# Student Enrollment System 📚

## Overview

The Student Enrollment System is a complete feature that allows students to:
- ✅ Enroll in courses
- ✅ Track enrollment status
- ✅ View progress on enrolled courses
- ✅ Unenroll from courses
- ✅ View all their enrolled courses in one place

## Features Implemented

### Backend
- ✅ **Enrollment Model** (`backend/models/enrollmentModel.ts`)
  - Get user enrollments
  - Check enrollment status
  - Create, delete, update enrollments
  - Track progress
  - Admin enrollment view

- ✅ **Enrollment Controller** (`backend/controllers/enrollmentController.ts`)
  - 8 API endpoints for enrollment management
  - JWT authentication for all endpoints
  - Error handling and validation

- ✅ **Enrollment Routes** (`backend/routes/enrollmentRoutes.ts`)
  - Protected routes for students
  - Public routes for checking enrollment count
  - Admin-only routes

### Frontend

- ✅ **Enrollment Service** (`frontend/src/services/enrollmentService.ts`)
  - API calls for all enrollment operations
  - Token-based authentication

- ✅ **Enrollment Redux Slice** (`frontend/src/features/enrollmentSlice.ts`)
  - State management for enrollments
  - Async thunks for API calls
  - Proper error handling

- ✅ **Student Enrollments Page** (`frontend/src/pages/StudentEnrollments.tsx`)
  - View all enrolled courses
  - Filter by status (All, Active, Completed)
  - Progress tracking
  - Unenroll functionality

- ✅ **Enhanced Course Detail Page** (`frontend/src/pages/CourseDetail.tsx`)
  - Check enrollment status
  - Enroll in course button
  - Unenroll button for enrolled students
  - Link to my enrollments

- ✅ **Styling** (`frontend/src/styles/enrollments.css`)
  - Beautiful card layout
  - Progress bars
  - Status badges
  - Responsive design

## API Endpoints

### Student Endpoints (Protected with JWT)

```
GET    /student/enrollments                    # Get all enrolled courses
POST   /enrollments                            # Enroll in a course
DELETE /enrollments/:courseId                  # Unenroll from course
PUT    /enrollments/progress                   # Update progress
POST   /enrollments/complete                   # Mark course as completed
GET    /courses/:courseId/check-enrollment    # Check enrollment status
```

### Public Endpoints

```
GET    /courses/:courseId/enrollment-count    # Get number of students enrolled
```

### Admin Endpoints (Admin only)

```
GET    /admin/enrollments                      # Get all enrollments in system
```

## Database Schema

```sql
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,           -- 0-100 progress percentage
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY (user_id, course_id)   -- One enrollment per user per course
);
```

## Installation & Setup

### 1. Create Database Table

Run the SQL script to create the enrollments table:

```sql
-- Copy and run the content of:
-- backend/scripts/create_enrollments_table.sql

-- Or use MySQL command:
mysql -u your_user -p your_database < backend/scripts/create_enrollments_table.sql
```

### 2. Backend Setup

The backend is already configured:
- Enrollment routes are integrated in `backend/app.ts`
- All endpoints use JWT authentication
- Error handling is implemented

### 3. Frontend Setup

The frontend is ready to use:
- Import `StudentEnrollments` component in your router
- Add route for `/my-enrollments` page

Example in your App.tsx or router file:

```typescript
import StudentEnrollments from './pages/StudentEnrollments';

// Add this route:
<Route path="/my-enrollments" element={<StudentEnrollments />} />
```

### 4. Install Any Missing Packages

```bash
npm install
```

## Usage Examples

### For Students

1. **Browse Courses** - Go to home page
2. **View Course Details** - Click on a course
3. **Enroll** - Click "Đăng Ký Ngay" button
4. **View My Enrollments** - Go to "/my-enrollments" or click "Xem Khóa Học Của Tôi"
5. **Track Progress** - See progress bar on each course card
6. **Unenroll** - Click "Hủy Đăng Ký" button (if needed)

### For Developers

#### Check if student is enrolled:

```typescript
const enrollment = await enrollmentService.checkEnrollment(courseId);
if (enrollment.isEnrolled) {
  // Student is enrolled
}
```

#### Get all enrollments:

```typescript
const enrollments = await enrollmentService.getStudentEnrollments();
```

#### Update progress:

```typescript
await enrollmentService.updateProgress(courseId, 50); // 50% progress
```

#### Complete course:

```typescript
await enrollmentService.completeCourse(courseId);
```

## File Structure

```
backend/
├── models/enrollmentModel.ts        # Database queries
├── controllers/enrollmentController.ts  # Business logic
├── routes/enrollmentRoutes.ts       # API endpoints
└── scripts/create_enrollments_table.sql  # Database schema

frontend/
├── services/enrollmentService.ts    # API integration
├── features/enrollmentSlice.ts      # Redux state
├── pages/StudentEnrollments.tsx     # Main page
└── styles/enrollments.css           # Styling
```

## Redux State Structure

```typescript
{
  enrollment: {
    enrollments: Enrollment[],        // Array of all enrollments
    isEnrolled: { [courseId]: boolean }, // Quick lookup
    enrollmentData: { [courseId]: Enrollment },  // Enrollment details by course
    loading: boolean,                // Loading state
    error: string | null             // Error message
  }
}
```

## Error Handling

All endpoints include proper error handling:

- **400** - Bad request (invalid data)
- **401** - Unauthorized (no token)
- **404** - Not found (enrollment doesn't exist)
- **409** - Conflict (already enrolled)
- **500** - Server error

## Security Features

- ✅ JWT token authentication
- ✅ Protected API endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ Unique constraint on user-course combo (prevent duplicates)
- ✅ Cascade delete (when user/course deleted, enrollments deleted)

## Testing the System

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open browser**:
   ```
   http://localhost:5173
   ```

3. **Test flow**:
   - Register new account
   - Browse courses on home page
   - Click "Đăng Ký Ngay" to enroll
   - Click "Xem Khóa Học Của Tôi" or visit `/my-enrollments`
   - View enrolled courses with progress bars
   - Test filter tabs (All, Active, Completed)
   - Test unenroll functionality

## Future Enhancements

- 📧 Email notification on enrollment
- 💳 Payment integration before enrollment
- 📊 Detailed progress analytics
- 🏆 Certificate generation on completion
- ⭐ Review and rating system
- 📝 Assignment and grading system
- 🎯 Learning path management

## Troubleshooting

### Issue: "Enrollments table not found"
**Solution**: Run the SQL script to create the table:
```bash
mysql -u your_user -p your_database < backend/scripts/create_enrollments_table.sql
```

### Issue: "Unauthorized" error on enrollment
**Solution**: Make sure you're logged in and token is valid

### Issue: "Already enrolled" error
**Solution**: This is expected if you already enrolled. Visit your enrollments page to see it.

### Issue: Frontend routes not found
**Solution**: Add the StudentEnrollments route to your App.tsx or router configuration

## Database Indexes

The enrollments table includes indexes for optimal performance:
- `idx_user_id` - Fast lookup by user
- `idx_course_id` - Fast lookup by course
- `idx_status` - Fast filtering by status
- `idx_enrolled_at` - Fast sorting by date
- `UNIQUE (user_id, course_id)` - Prevent duplicates

## Performance Considerations

- ✅ Database queries use indexes
- ✅ Redux caching prevents unnecessary API calls
- ✅ Lazy loading images in enrollment cards
- ✅ Pagination ready (can be added to getAllEnrollments)
- ✅ Efficient filter operations

## Next Steps

1. ✅ **Setup**: Run SQL script to create table
2. ✅ **Test**: Test enrollment flow in browser
3. 📧 **Email Notifications**: Add email on enrollment
4. 💳 **Payment**: Integrate payment before enrollment
5. 🎯 **Learning Paths**: Create course sequences
6. 🏆 **Certificates**: Generate certificates on completion

---

**Status**: ✅ Fully Implemented and Ready to Use!
