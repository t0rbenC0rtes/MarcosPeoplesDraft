import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, signOut, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>
            Marcos Pe<span style={{ color: "red" }}>oples</span>
          </h1>
          <span className="subtitle">1972 - 2025</span>
        </Link>

        <nav className="nav">
          <Link to="/">Map</Link>
          <Link to="/share">Share Memory</Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={signOut} className="btn-text">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login">Sign In</Link>
          )}
        </nav>

        {user && (
          <div className="user-badge">
            {user.profile_pic_url ? (
              <img
                src={user.profile_pic_url}
                alt={user.name}
                className="avatar"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
