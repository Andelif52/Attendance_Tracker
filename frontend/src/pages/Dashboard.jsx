import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/reports";
import { listCourses } from "../api/courses";
import { listSessions, getActiveSession, startSession, endSession } from "../api/attendance";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    active_sessions: 0,
    today_present: 0,
    today_absent: 0,
    today_late: 0,
    today_percentage: 0.0,
  });

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lateThreshold, setLateThreshold] = useState(15);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, coursesData, sessionsData, activeData] = await Promise.all([
        getDashboardStats().catch(() => null),
        listCourses().catch(() => ({ courses: [] })),
        listSessions({ limit: 10 }).catch(() => []),
        getActiveSession().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (coursesData?.courses) setCourses(coursesData.courses);
      if (Array.isArray(sessionsData)) setSessions(sessionsData);
      setActiveSession(activeData);
    } catch (error) {
      setMessage(error.message || "Failed to load dashboard data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setMessage("Please select a course to start a session.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const newSession = await startSession({
        course_id: selectedCourseId,
        late_threshold_minutes: Number(lateThreshold) || 15,
      });
      setMessage(`Session started successfully for course ID ${selectedCourseId}.`);
      setSelectedCourseId("");
      await loadData();
      // Optionally navigate directly to Attendance page
      navigate("/attendance");
    } catch (error) {
      setMessage(error.message || "Failed to start session.");
    } finally {
      setBusy(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setBusy(true);
    setMessage("");

    try {
      await endSession(activeSession.session_id, "completed");
      setMessage("Attendance session completed and closed.");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Failed to end session.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p className="dashboard-description">
            Welcome back, {user?.name || "Teacher"}. Powered by FastAPI & Firebase.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students-icon">👥</div>
          <div className="stat-info">
            <p>Total Students</p>
            <h2>{stats.total_students}</h2>
            <Link to="/students" className="dashboard-nav-button">
              View Students
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon present-icon">📚</div>
          <div className="stat-info">
            <p>Total Courses</p>
            <h2>{stats.total_courses || courses.length}</h2>
            <span className="stat-positive">Active in Firestore</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon present-icon">✓</div>
          <div className="stat-info">
            <p>Live Sessions</p>
            <h2>{stats.active_sessions}</h2>
            <span className={activeSession ? "stat-positive" : ""}>
              {activeSession ? "1 session running" : "No active session"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accuracy-icon">◎</div>
          <div className="stat-info">
            <p>Today's Present</p>
            <h2>{stats.today_present}</h2>
            <span className="stat-positive">
              {stats.today_percentage ? `${stats.today_percentage.toFixed(0)}% Rate` : "0% Rate"}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="attendance-card">
          <div className="card-header">
            <div>
              <h2>Start Attendance Session</h2>
              <p>Select an accredited course to initiate face recognition attendance.</p>
            </div>
          </div>

          {activeSession ? (
            <div className="attendance-details">
              <p>
                Live session running for course:{" "}
                <strong>
                  {courses.find((c) => c.course_id === activeSession.course_id)?.course_name ||
                    activeSession.course_id}
                </strong>{" "}
                (Late threshold: {activeSession.late_threshold_minutes}m)
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  className="view-button"
                  type="button"
                  onClick={() => navigate("/attendance")}
                  style={{ background: "#CB2957", color: "#fff", borderColor: "#CB2957" }}
                >
                  Open Live Camera Console
                </button>
                <button
                  className="view-button"
                  type="button"
                  onClick={handleEndSession}
                  disabled={busy}
                >
                  End Session
                </button>
              </div>
            </div>
          ) : (
            <form className="session-form" onSubmit={handleStartSession}>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name} ({course.course_code} · Sec {course.section})
                  </option>
                ))}
              </select>

              <input
                placeholder="Late threshold (minutes)"
                type="number"
                min="1"
                max="120"
                value={lateThreshold}
                onChange={(e) => setLateThreshold(e.target.value)}
                required
              />

              <button className="view-button" type="submit" disabled={busy || courses.length === 0}>
                {busy ? "Starting..." : "Start Session"}
              </button>
            </form>
          )}

          {courses.length === 0 && (
            <p className="dashboard-description" style={{ color: "#CB2957" }}>
              No courses found in database. Create a course first to start sessions.
            </p>
          )}

          {message && (
            <p
              className="dashboard-description"
              style={{
                marginTop: "12px",
                fontWeight: 600,
                color: message.includes("success") || message.includes("started") ? "#15803d" : "#CB2957",
              }}
            >
              {message}
            </p>
          )}
        </div>

        <div className="activity-card">
          <div className="card-header">
            <div>
              <h2>Recent Sessions</h2>
              <p>Latest attendance logs from Firebase</p>
            </div>
            <Link to="/attendance" className="view-button">
              View All
            </Link>
          </div>

          <div className="activity-list">
            {sessions.slice(0, 6).map((session) => {
              const cName =
                courses.find((c) => c.course_id === session.course_id)?.course_name ||
                session.course_id;
              return (
                <div className="activity-item" key={session.session_id}>
                  <div className="activity-avatar">
                    {(cName || "AS").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="activity-info">
                    <strong>{cName}</strong>
                    <p>
                      Date: {session.session_date} · Status:{" "}
                      <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                        {session.status}
                      </span>{" "}
                      · Present: {session.present_count || 0}
                    </p>
                  </div>
                  <span className="activity-time">
                    {session.start_time
                      ? new Date(session.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <p className="dashboard-description">No sessions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

