import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import type { RootState } from "../app/store";
import "../styles/Dashboard.css";

interface NavLink {
  name: string;
  path: string;
  icon: string;
}

interface DashboardLayoutProps {
  roleName: string;
  logoLetter: string;
  navLinks: NavLink[];
}

const DashboardLayout = ({ roleName, logoLetter, navLinks }: DashboardLayoutProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => dispatch(logout());

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">{logoLetter}</div>
          <h2>LMS {roleName}</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navLinks.map((link) => (
              <li key={link.path} className="sidebar-item">
                <Link
                  to={link.path}
                  className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
                >
                  <span className="sidebar-icon">{link.icon}</span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info-sidebar">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() || roleName.charAt(0)}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || roleName}</p>
              <p className="user-role">{roleName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="dashboard-content-wrapper">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="heading-2">Bảng điều khiển</h1>
          </div>
        </header>
        
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;