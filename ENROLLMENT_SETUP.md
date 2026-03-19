# 🚀 Student Enrollment System - Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Database Table

Open MySQL and run:

```sql
-- Run this SQL to create the enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_enrolled_at (enrolled_at)
);
```

Or copy from file:
```bash
mysql -u username -p database_name < backend/scripts/create_enrollments_table.sql
```

### Step 2: Start the Application

The code is already integrated! Just run:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

### Step 3: Test the Enrollment System

1. Open `http://localhost:5173` in your browser
2. **Register** a new account
3. **Go to Home Page** and view courses
4. **Click a course** to see details
5. **Click "Đăng Ký Ngay"** to enroll
6. **Click "Xem Khóa Học Của Tôi"** to view your enrollments
7. **Toggle filters** to see active/completed courses

---

## Files Added/Modified

### New Files Created ✨

**Backend:**
- `backend/models/enrollmentModel.ts` - Database queries
- `backend/controllers/enrollmentController.ts` - API logic  
- `backend/routes/enrollmentRoutes.ts` - API routes
- `backend/scripts/create_enrollments_table.sql` - Database schema

**Frontend:**
- `frontend/src/services/enrollmentService.ts` - API client
- `frontend/src/features/enrollmentSlice.ts` - Redux state
- `frontend/src/pages/StudentEnrollments.tsx` - Main page
- `frontend/src/styles/enrollments.css` - Styling

**Documentation:**
- `ENROLLMENT_SYSTEM.md` - Complete documentation

### Files Modified 🔄

**Backend:**
- `backend/app.ts` - Added enrollment routes

**Frontend:**
- `frontend/src/app/store.ts` - Added enrollment reducer
- `frontend/src/pages/CourseDetail.tsx` - Added enrollment buttons
- `frontend/src/styles/courseDetail.css` - Added button styles
- `frontend/src/type/coursesType.ts` - Added enrollment types
- `frontend/src/App.tsx` - Added enrollment routes
- `frontend/src/styles/enrollments.css` - New stylesheet

---

## API Endpoints

### For Students (Protected with JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/enrollments` | Get all your enrolled courses |
| POST | `/enrollments` | Enroll in a course |
| DELETE | `/enrollments/:courseId` | Unenroll from a course |
| PUT | `/enrollments/progress` | Update your progress |
| POST | `/enrollments/complete` | Mark course as completed |
| GET | `/courses/:courseId/check-enrollment` | Check if enrolled |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses/:courseId/enrollment-count` | Get class size |

### Admin Only (Protected + Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/enrollments` | View all enrollments |

---

## Database Schema

```sql
enrollments table:
├── id (INT) - Primary key
├── user_id (INT) - Foreign key to users
├── course_id (INT) - Foreign key to courses  
├── enrolled_at (TIMESTAMP) - When enrolled
├── progress (INT 0-100) - Learning progress %
├── status (ENUM) - 'active', 'completed', 'cancelled'
├── UNIQUE (user_id, course_id) - Prevent duplicates
└── Indexes for fast queries
```

---

## Redux Store Structure

```
state.enrollment = {
  enrollments: [],              // All enrolled courses
  isEnrolled: {},               // Is user enrolled in course? 
  enrollmentData: {},           // Enrollment details by course
  loading: false,               // API loading state
  error: null                   // Error messages
}
```

---

## Component Flow

```
Home.tsx
  ↓
CourseDetail.tsx (with Enrollment)
  ├─→ Check: Is user enrolled?
  ├─→ Button: "Đăng Ký Ngay" or "✓ Đã Đăng Ký"
  └─→ Link: Go to StudentEnrollments
      
StudentEnrollments.tsx
  ├─→ Load all enrollments
  ├─→ Display cards with progress
  ├─→ Filter by status (All/Active/Completed)
  └─→ Actions: Unenroll, view details
```

---

## TypeScript Types

```typescript
// Enrollment type
type Enrollment = {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  progress: number;           // 0-100
  status: 'active' | 'completed' | 'cancelled';
  course_name: string;
  course_description: string;
  course_price: number;
  course_image: string;
  teacher_id: number;
  teacher_name: string;
};

type EnrollmentCheck = {
  isEnrolled: boolean;
  enrollment?: Enrollment | null;
};
```

---

## Features List

✅ **Enroll in Courses**
- Click button to enroll
- Prevents duplicate enrollment
- Shows success message

✅ **View My Enrollments**  
- See all enrolled courses
- Progress bars
- Status badges
- Course information

✅ **Track Progress**
- Visual progress bar
- Percentage display
- Update progress (API ready)

✅ **Filter Enrollments**
- All courses
- Active courses only
- Completed courses only
- Count displayed

✅ **Unenroll from Course**
- Remove from enrollment list
- Confirmation dialog
- Instant update

✅ **Responsive Design**
- Works on desktop
- Tablet friendly
- Mobile optimized

✅ **Error Handling**
- User-friendly messages
- API error feedback
- Loading states

---

## Security Features

✅ JWT Token Authentication
- All student endpoints protected
- Token sent in Authorization header
- Token stored in localStorage

✅ Database Security
- Parameterized queries (prevent SQL injection)
- Foreign key constraints
- Cascade delete
- UNIQUE constraint prevents duplicates

✅ Role-based Access Control
- Admin endpoints require admin role
- Student endpoints require authentication
- Public endpoints available to all

---

## Testing Checklist

- [ ] Database table created
- [ ] Application starts without errors
- [ ] Can register new account
- [ ] Can view courses on home page
- [ ] Can click course to see details
- [ ] Can enroll in course
- [ ] Button changes to "✓ Đã Đăng Ký"
- [ ] Can navigate to "Xem Khóa Học Của Tôi"
- [ ] See enrolled course in list
- [ ] Progress bar displays
- [ ] Status badge shows "Đang Học"
- [ ] Can filter by status
- [ ] Can unenroll from course
- [ ] Course removed from list after unenroll
- [ ] Error messages display properly
- [ ] Works responsively on mobile

---

## Troubleshooting

### ❌ Error: "Table 'enrollments' doesn't exist"
**Solution**: Run the SQL script to create the table
```sql
-- Copy and paste the SQL from create_enrollments_table.sql
```

### ❌ Error: "Unauthorized"
**Solution**: Make sure you're logged in and your token is valid
- Check localStorage has "token"
- Try logging in again
- Check token hasn't expired

### ❌ Error: "Already enrolled"
**Solution**: You already have this course! Go to your enrollments page
- Visit `/my-enrollments`
- Your course should be listed there

### ❌ Course not showing in enrollments
**Solution**: 
- Refresh the page
- Check browser console for errors
- Make sure enrollment was successful (check API response)

### ❌ Buttons not responding
**Solution**:
- Make sure you're logged in
- Check network tab in Dev Tools
- Ensure backend is running on port 3000

### ❌ Enrollment page is blank
**Solution**:
- You may not have any enrollments yet
- Try enrolling in a course first
- Check browser console for errors

---

## Performance Tips

🚀 **Frontend**
- Redux caching prevents duplicate API calls
- Lazy loading on course images
- Efficient state management
- Memoization ready

🚀 **Backend**
- Database indexes for fast queries
- Parameterized queries prevent slowdown
- Efficient joins in SQL
- Pagination ready for large datasets

---

## Future Enhancements

Next features to add:

1. **📧 Email Notifications**
   - Welcome email on enrollment
   - Course completion certificate

2. **💳 Payment Integration**  
   - Stripe/PayPal integration
   - Payment verification before enrollment

3. **📊 Analytics Dashboard**
   - Student progress stats
   - Course popularity
   - Enrollment trends

4. **🏆 Certificate System**
   - Auto-generate certificate on completion
   - PDF download
   - Share to LinkedIn

5. **📝 Assignments**
   - Assignment upload
   - Grading system
   - Feedback to students

6. **🎯 Learning Paths**
   - Multi-course sequences
   - Prerequisites
   - Skill tracking

---

## Support

For issues or questions:
1. Check [ENROLLMENT_SYSTEM.md](ENROLLMENT_SYSTEM.md) for full docs
2. Review troubleshooting section above
3. Check browser console for error messages
4. Verify database table was created

---

**Last Updated**: March 19, 2026  
**Status**: ✅ Production Ready
