import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes";
import courseRoutes from "./routes/courseRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import quizRoutes from "./routes/quizRoutes";
import lessonProgressRoutes from "./routes/lessonProgressRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import adminRoutes from "./routes/adminRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import categoryRoutes from "./routes/categoryRoutes";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (origin.startsWith('http://localhost:5173') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api", courseRoutes);
app.use("/api/categories", categoryRoutes)
app.use("/api", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use('/api/progress', lessonProgressRoutes);
app.use('/api/transactions', transactionRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Protected dashboard routes
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});