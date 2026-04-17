import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { Loading } from "./Loading";

// Thêm vào file constants hoặc types
export const UserRole = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
} as const;

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.role) 
    ? <Outlet /> 
    : <Navigate to="/unauthorized" replace />; 
};

export default ProtectedRoute;