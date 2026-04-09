import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import type { RootState } from "../app/store";
import "../styles/Dashboard.css"; 

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navLinks = [
    { name: "System Overview", path: "/admin", icon: "📊" },
    { name: "Users Management", path: "/admin/users", icon: "👥" },
    { name: "Course Moderation", path: "/admin/courses", icon: "📚" },
    { name: "Categories", path: "/admin/categories", icon: "📑" },
    { name: "Transactions", path: "/admin/transactions", icon: "💳" },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">A</div>
          <h2>LMS Admin</h2>
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
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || "Admin"}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-content-wrapper">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="heading-2">System Dashboard</h1>
          </div>
          <div className="header-right">
            {/* <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search users, courses..." />
            </div>
            <button className="notification-btn">
              🔔<span className="notification-dot"></span>
            </button> */}
          </div>
        </header>
        
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;