import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import authReducer from "../features/authSlice";
import courseReducer from "../features/courseSlice";
import enrollmentReducer from "../features/enrollmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    enrollment: enrollmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
