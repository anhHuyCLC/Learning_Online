import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import type { RootState } from "../app/store";
import "../styles/Dashboard.css"; 

const TeacherLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navLinks = [
    { name: "Overview", path: "/teacher", icon: "📊" },
    { name: "My Courses", path: "/teacher/courses", icon: "📚" },
    { name: "Students", path: "/teacher/students", icon: "👥" },
    { name: "Quizzes", path: "/teacher/quizzes", icon: "✍️" },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <h2>LMS Teacher</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="sidebar-item">
                  <Link
                    to={link.path}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <span className="sidebar-icon">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info-sidebar">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || "Teacher"}</p>
              <p className="user-role">Teacher</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-content-wrapper">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="heading-2">Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-btn">
              🔔<span className="notification-dot"></span>
            </button>
          </div>
        </header>
        
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;