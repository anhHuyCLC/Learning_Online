import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import authReducer from "../features/authSlice";
import courseReducer from "../features/courseSlice";
import enrollmentReducer from "../features/enrollmentSlice";
import quizReducer from "../features/quizSlice";
import progressReducer from "../features/progressSlice";
import adminReducer from "../features/adminSlice";
import teacherReducer from "../features/teacherSlice";
import recommendationReducer from "../features/recommendationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    enrollment: enrollmentReducer,
    quiz: quizReducer,
    progress: progressReducer,
    admin: adminReducer,
    teacher: teacherReducer,
    recommendations: recommendationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
