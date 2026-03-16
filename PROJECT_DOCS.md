# 📚 LMS Online Learning Platform - Documentation

## Project Overview
A complete full-stack learning management system (LMS) built with:
- **Frontend**: React + Redux Toolkit + TypeScript + Vite
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: MySQL
- **Real-time**: JWT Authentication, Role-based Access Control

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Development
```bash
npm run dev
```
This will start both backend (port 3000) and frontend (port 5173) concurrently.

---

## 📁 Project Structure

### Frontend
```
frontend/src/
├── pages/
│   ├── Home.tsx              # Landing page (SaaS style)
│   ├── Login.tsx             # Beautiful login page
│   ├── Register.tsx          # Professional registration
│   ├── AdminDashboard.tsx    # Admin management panel
│   └── TeacherDashboard.tsx  # Teacher course management
├── components/
│   ├── Header.tsx            # Reusable header
│   ├── Card.tsx              # Card component system
│   ├── Button.tsx            # Button variants
│   ├── Loading.tsx           # Loading spinner
│   ├── Error.tsx             # Error message
│   ├── Modal.tsx             # Modal dialog
│   └── index.ts              # Component exports
├── services/
│   ├── authService.ts        # Auth API calls
│   └── courseService.ts      # Course API calls
├── features/
│   ├── authSlice.ts          # Redux auth state
│   └── courseSlice.ts        # Redux course state
├── styles/
│   ├── vars.css              # Design tokens
│   ├── home.css              # Landing page styles
│   ├── auth.css              # Auth pages (login/register)
│   ├── dashboard.css         # Dashboard styles
│   └── components.css        # Component styles
└── type/
    └── coursesType.ts        # TypeScript interfaces
```

### Backend
```
backend/
├── app.ts                    # Express setup & middleware
├── config/
│   └── db.ts                 # MySQL connection pool
├── controllers/
│   ├── authController.ts     # Auth logic (login/register)
│   └── courseController.ts   # Course CRUD operations
├── middleware/
│   ├── authMiddleware.ts     # JWT verification
│   └── validation.ts         # Input validation
├── models/
│   ├── userModel.ts          # User DB queries
│   └── courseModel.ts        # Course DB queries
├── routes/
│   ├── userRoutes.ts         # Auth endpoints
│   └── courseRoute.ts        # Course endpoints
├── scripts/
│   └── hashPasswords.ts      # Utility scripts
└── utils/
    └── jwt.ts                # JWT token helpers
```

---

## 🎨 Features

### Frontend Features
✅ **Gorgeous Landing Page**
- Hero section with gradient blobs
- Feature cards with animations
- Stats section with hover effects
- Modern CTA buttons
- Responsive design

✅ **Authentication**
- Beautiful login/register pages
- Two-column layout with gradient side
- Form validation
- Error messaging
- Loading states

✅ **Dashboard Pages**
- Sidebar navigation
- Widget cards with statistics
- Data tables with formatting
- Professional layout
- Role-based access (Admin/Teacher/Student)

✅ **Reusable Components**
- Header, Card system, Button variants
- Loading spinner, Error messages, Modal
- All with smooth animations

✅ **Styling**
- Modern design system with CSS variables
- Gradient backgrounds and animations
- Responsive across all devices
- Smooth transitions and hover effects

### Backend Features
✅ **Authentication**
- JWT token generation & verification
- Hashed password storage (bcrypt)
- Role-based access control (RBAC)
- Token stored in localStorage

✅ **API Endpoints**

**Authentication** (userRoutes.ts)
```
POST   /users/login         # Login with email/password
POST   /users/register      # Register new account
```

**Courses** (courseRoute.ts)
```
GET    /courses             # Get all courses (protected)
GET    /courses/:id         # Get course by ID (protected)
POST   /courses             # Create new course (protected)
PUT    /courses/:id         # Update course (protected)
DELETE /courses/:id         # Delete course (protected)
```

✅ **Middleware**
- JWT authentication verification
- Input validation (email, password, etc.)
- CORS enabled
- Error handling

✅ **Database**
- MySQL with connection pooling
- User table (id, name, email, password_hash, role)
- Course table (id, name, description, price, instructor_id)

---

## 🔐 Security Features

1. **JWT Authentication**
   - Token stored in localStorage
   - Sent in Authorization header
   - Expires after set time

2. **Password Security**
   - Bcrypt hashing
   - Salted passwords
   - Never stored as plain text

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Required field checks

4. **Protected Routes**
   - Admin dashboard requires admin role
   - Teacher dashboard requires teacher role
   - Course endpoints require authentication

5. **Environment Variables**
   - DB credentials in .env
   - API URL configuration
   - Port customization

---

## 🎯 User Roles

### Student
- View landing page and courses
- Browse available courses
- Access personal dashboard (if implemented)

### Teacher
- Access teacher dashboard
- Manage own courses
- View students and enrollments
- Manage content

### Admin
- Access admin dashboard
- Manage all users
- Manage all courses
- System statistics and logs

---

## 🛠️ Development

### Running Tests
```bash
npm run lint        # Run ESLint
npm run build       # Build for production
npm run format:css  # Format CSS with Prettier
npm run lint:css    # Lint CSS with Stylelint
```

### File Structure Rules
- All page components in `pages/` folder
- Reusable components in `components/`
- Services for API calls in `services/`
- Redux slices in `features/`
- Styles organized by feature (home.css, auth.css, etc.)

---

## 📊 Database Schema

### users table
```sql
- id (PK, auto increment)
- name (varchar255)
- email (varchar255, unique)
- password_hash (varchar255)
- role (enum: 'student', 'teacher', 'admin')
- created_at (timestamp)
```

### courses table
```sql
- id (PK, auto increment)
- name (varchar255)
- description (text)
- price (decimal, default 0)
- instructor_id (FK to users.id)
- created_at (timestamp)
```

---

## 🎨 Design System

### Colors
- Primary: `#0066ff` (Blue)
- Accent: `#8b5cf6` (Purple)
- Success: `#16a34a` (Green)
- Danger: `#ef4444` (Red)
- Background: `#f6f9fc`
- Text: `#0f1724`

### Typography
- Font: Inter (via Google Fonts)
- Sizes: xs(14px) → xxl(32px)
- Weights: 300, 400, 600, 700, 800

### Spacing
- Base unit: 16px (--g)
- Padding: var(--g-x) = 20px
- Gap: var(--g-xx) = 28px

### Animations
- Duration: 140ms (fast) → 260ms (normal)
- Easing: cubic-bezier(0.2, 0.9, 0.2, 1)
- Effects: fade, slide, float, glow, shimmer

---

## 🚀 Deployment

### Frontend (Vite)
```bash
npm run build
# Deploy dist/ folder to:
# - Vercel, Netlify, GitHub Pages, etc.
```

### Backend (Node.js)
```bash
npm run build
# Deploy to:
# - Heroku, Railway, DigitalOcean, AWS, etc.
# Remember to:
# - Set environment variables
# - Configure CORS origins
# - Set up MySQL database
```

---

## 📝 Environment Variables

Create `.env` file in project root:
```
# Backend
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=learning_platform
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Frontend (.env in frontend/)
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MySQL Connection Failed
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

### Token Not Persisting
- Check localStorage enabled
- Verify token key name matches

### CORS Errors
- Check FRONTEND_URL in backend .env
- Verify credentials: true in axios config

---

## 📚 Next Steps

1. **Connect Dashboard to Real Data**
   - Fetch users for admin dashboard
   - Display real course statistics

2. **Add More Features**
   - Course enrollment system
   - Student progress tracking
   - Course ratings and reviews
   - Messaging system

3. **Enhance Security**
   - Refresh token mechanism
   - Rate limiting
   - Input sanitization

4. **Performance**
   - Database query optimization
   - Caching strategies
   - Image optimization

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

---

## 📞 Support

For issues or questions:
1. Check the documentation above
2. Review code comments
3. Check browser console for errors
4. Check backend logs

---

## 📄 License

This project is created for educational purposes.

---

**Last Updated**: March 14, 2026
**Version**: 1.0.0
