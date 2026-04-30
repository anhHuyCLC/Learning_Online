import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import type { RootState } from "../app/store";
import "../styles/dashboard.css";
import React from "react";

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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => dispatch(logout());

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div className="logo-icon" style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '20px'
          }}>
            {logoLetter}
          </div>
          <div>
            <h2 style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>LMS</h2>
            <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>{roleName}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-item ${location.pathname === link.path ? "active" : ""}`}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <span style={{ fontSize: '18px' }}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {user?.name?.charAt(0).toUpperCase() || roleName.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                {user?.name || roleName}
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>{roleName}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 260ms cubic-bezier(0.2, 0.9, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--danger)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--danger-light)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'none'
            }}
            className="menu-toggle"
          >
            ☰
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>
            Bảng điều khiển
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <span style={{ fontSize: '20px' }}>⚙️</span>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;