import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppNav.css";

function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="app-nav">
      <div className="app-nav-brand">Attendance Tracker</div>

      <nav className="app-nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/students">Students</NavLink>
        <NavLink to="/attendance">Attendance</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </nav>

      <div className="app-nav-user">
        <span>
          {user?.name} · {user?.role === "ADMIN" ? "Admin" : "Teacher"}
        </span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default AppNav;
