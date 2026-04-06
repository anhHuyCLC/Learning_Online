import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/store';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;