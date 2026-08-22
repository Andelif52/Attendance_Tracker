import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-subtitle">Overview</p>
          <h1>Dashboard</h1>
          <p className="dashboard-description">
            Welcome back! Here's what's happening with your attendance system.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>
          <strong>August 22, 2026</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students-icon">👥</div>
          <div className="stat-info">
            <p>Total Students</p>
            <h2>120</h2>
            <Link to="/students" className="dashboard-nav-button">
  View Students
</Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon present-icon">✓</div>
          <div className="stat-info">
            <p>Present Today</p>
            <h2>96</h2>
            <span className="stat-positive">80% attendance</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon absent-icon">✕</div>
          <div className="stat-info">
            <p>Absent Today</p>
            <h2>24</h2>
            <span className="stat-negative">20% absent</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accuracy-icon">◎</div>
          <div className="stat-info">
            <p>AI Accuracy</p>
            <h2>98.5%</h2>
            <span className="stat-positive">Excellent</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="attendance-card">
          <div className="card-header">
            <div>
              <h2>Today's Attendance</h2>
              <p>Real-time attendance overview</p>
            </div>

            <Link to="/attendance" className="view-button">
              View Details
            </Link>
          </div>

          <div className="attendance-overview">
            <div className="attendance-circle">
              <div className="circle-inner">
                <strong>80%</strong>
                <span>Present</span>
              </div>
            </div>

            <div className="attendance-details">
              <div className="attendance-item">
                <span className="status-dot present-dot"></span>
                <div>
                  <strong>96 Students</strong>
                  <p>Present</p>
                </div>
              </div>

              <div className="attendance-item">
                <span className="status-dot absent-dot"></span>
                <div>
                  <strong>24 Students</strong>
                  <p>Absent</p>
                </div>
              </div>

              <div className="attendance-item">
                <span className="status-dot late-dot"></span>
                <div>
                  <strong>8 Students</strong>
                  <p>Late</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest attendance records</p>
            </div>

            <button className="more-button">•••</button>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar">AR</div>
              <div className="activity-info">
                <strong>Ahmed Rahman</strong>
                <p>Marked present</p>
              </div>
              <span className="activity-time">10:02 AM</span>
            </div>

            <div className="activity-item">
              <div className="activity-avatar">NS</div>
              <div className="activity-info">
                <strong>Nusrat Sultana</strong>
                <p>Marked present</p>
              </div>
              <span className="activity-time">10:01 AM</span>
            </div>

            <div className="activity-item">
              <div className="activity-avatar">RH</div>
              <div className="activity-info">
                <strong>Rakib Hasan</strong>
                <p>Marked present</p>
              </div>
              <span className="activity-time">9:59 AM</span>
            </div>

            <div className="activity-item">
              <div className="activity-avatar">FA</div>
              <div className="activity-info">
                <strong>Fatima Akter</strong>
                <p>Marked present</p>
              </div>
              <span className="activity-time">9:57 AM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="system-status">
        <div className="system-status-left">
          <span className="online-dot"></span>
          <div>
            <strong>AI Attendance System Online</strong>
            <p>Camera and recognition system are working normally.</p>
          </div>
        </div>

        <span className="system-status-time">
          Last updated: Just now
        </span>
      </div>
    </div>
  );
}

export default Dashboard;