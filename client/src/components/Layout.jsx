import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();
  const body = children ?? <Outlet />;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand" end>
            <span aria-hidden="true">📚</span>
            <span>Used Book Exchange</span>
          </NavLink>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : undefined)} end>
              Browse
            </NavLink>
            <NavLink to="/list" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              List a book
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Orders
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Profile
            </NavLink>
          </nav>
          <div className="header-actions">
            <div className="user-slot">
              {user ? (
                <span>
                  Signed in as <strong title={user.email}>{user.name}</strong>
                </span>
              ) : (
                <span className="muted">No profile</span>
              )}
            </div>
            <NavLink to="/register" className="btn btn-ghost btn-sm">
              Account
            </NavLink>
          </div>
        </div>
      </header>

      <main id="main-content" className="main" tabIndex={-1}>
        {body}
      </main>

      <footer className="site-footer">
        <p>Used Book Exchange — React client (Vite).</p>
      </footer>
    </>
  );
}
