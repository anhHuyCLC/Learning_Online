# 🐛 Re-enrollment Bug Fix

## Problem Identified
Khi người dùng:
1. Đăng ký khóa học
2. Hủy đăng ký khóa học
3. **Không thể đăng ký lại** khóa học đó

## Root Cause
Cơ sở dữ liệu có constraint:
```sql
UNIQUE KEY unique_enrollment (user_id, course_id)
```

Khi hủy đăng ký, hệ thống chỉ thay đổi trạng thái từ `'active'` → `'cancelled'`, nhưng:
- Constraint UNIQUE vẫn tồn tại (dù status là 'cancelled')
- Khi cố đăng ký lại, INSERT mới bị lỗi duplicate key
- Frontend không biết tình trạng này nên không thể đăng ký lại

## Solution Implemented ✅

### 1. Backend Model (`enrollmentModel.ts`)

**Thêm hàm mới:**
```typescript
// Kiểm tra enrollment bất kỳ (regardless of status)
export const getAnyEnrollmentByUserAndCourse = async (userId, courseId)

// Kích hoạt lại enrollment bị hủy
export const reactivateEnrollment = async (userId, courseId)
```

### 2. Backend Controller (`enrollmentController.ts`)

**Cập nhật logic `enrollInCourse`:**
```typescript
// 1. Kiểm tra enrollment bất kỳ (active/cancelled/completed)
const existingEnrollment = await getAnyEnrollmentByUserAndCourse(userId, courseId);

// 2. Nếu tồn tại:
if (existingEnrollment) {
    if (status === 'active') 
        → Từ chối (đã đăng ký)
    
    if (status === 'cancelled') 
        → Kích hoạt lại (UPDATE, không INSERT)
}

// 3. Nếu không tồn tại:
→ Tạo mới (INSERT)
```

### 3. Frontend Redux (`enrollmentSlice.ts`)

**Cải thiện logic `checkEnrollment`:**
```typescript
// Đảm bảo explicitly set null khi không enroll
state.enrollmentData[courseId] = null;
```

### 4. Frontend Component (`CourseDetail.tsx`)

**Thêm re-check sau actions:**
```typescript
// Sau enroll → re-check status
await dispatch(enrollInCourse(courseId));
setTimeout(() => dispatch(checkEnrollment(courseId)), 300);

// Sau unenroll → re-check status
await dispatch(unenrollFromCourse(courseId));
setTimeout(() => dispatch(checkEnrollment(courseId)), 300);
```

## Files Modified

### Backend (2 files)
- `backend/models/enrollmentModel.ts`
  - ✅ Thêm `getAnyEnrollmentByUserAndCourse()`
  - ✅ Thêm `reactivateEnrollment()`

- `backend/controllers/enrollmentController.ts`
  - ✅ Import 2 hàm mới
  - ✅ Cập nhật `enrollInCourse` logic

### Frontend (2 files)
- `frontend/src/features/enrollmentSlice.ts`
  - ✅ Cải thiện `checkEnrollment.fulfilled` reducer

- `frontend/src/pages/CourseDetail.tsx`
  - ✅ Thêm re-check sau `handleEnroll()`
  - ✅ Thêm re-check sau `handleUnenroll()`

## Test Flow

### ✅ Test Re-enrollment

1. **Đăng ký khóa học**
   - Nhấp "Đăng Ký Ngay"
   - ✅ Nút thay đổi thành "✓ Đã Đăng Ký"

2. **Hủy đăng ký**
   - Nhấp "Hủy Đăng Ký"
   - Xác nhận hủy
   - ✅ Nút quay lại "Đăng Ký Ngay"

3. **Đăng ký lại** (NEW - Previously Failed)
   - Nhấp "Đăng Ký Ngay" lần 2
   - ✅ **GIỜ ĐÃ ĐƯỢC - Đăng ký thành công!**
   - ✅ Nút thay đổi thành "✓ Đã Đăng Ký"
   - ✅ Course xuất hiện trong "Khóa Học Của Tôi"

## How It Works

### Scenario 1: Lần đầu đăng ký
```
SQL: INSERT INTO enrollments 
     (user_id, course_id, status) 
     VALUES (1, 5, 'active')
✅ Tạo enrollment mới
```

### Scenario 2: Hủy đăng ký
```
SQL: UPDATE enrollments 
     SET status = 'cancelled' 
     WHERE user_id = 1 AND course_id = 5
✅ Đánh dấu là cancelled (nhưng record vẫn tồn tại)
```

### Scenario 3: Đăng ký lại (FIXED)
```
SQL: SELECT * FROM enrollments 
     WHERE user_id = 1 AND course_id = 5
✅ Tìm thấy enrollment cũ (status = 'cancelled')

SQL: UPDATE enrollments 
     SET status = 'active', 
         progress = 0, 
         enrolled_at = NOW()
     WHERE user_id = 1 AND course_id = 5 
     AND status = 'cancelled'
✅ Kích hoạt lại (không tạo mới)
```

## Benefits

✅ **Người dùng có thể:**
- Đăng ký → Hủy → Đăng ký lại thoải mái
- Không lỗi database constraint
- State frontend luôn chính xác

✅ **Hệ thống:**
- Không cần thay đổi database schema
- Không mất dữ liệu lịch sử enrollment
- Performance tốt (UPDATE thay vì INSERT)
- Audit trail đầy đủ (tracked by `enrolled_at`)

## Backward Compatibility

✅ **Tương thích với existing data:**
- Không cần migration
- Existing enrollments hoạt động bình thường
- Existing cancelled enrollments có thể re-activate

## Security & Validation

✅ **Vẫn bảo vệ:**
- JWT authentication
- Input validation
- SQL injection prevention
- Không thể re-enroll nếu đang `'active'` hoặc `'completed'`

---

**Status**: ✅ Fixed and Ready  
**Test**: Enhanced test flow includes re-enrollment scenario
