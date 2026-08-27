import "./Dashboard.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

function Dashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    year: "",
    semester: "",
    section: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    const [studentPayload, sessionPayload] = await Promise.all([
      apiRequest("/api/students"),
      apiRequest("/api/sessions"),
    ]);
    setStudents(studentPayload.data.students);
    setSessions(sessionPayload.data.sessions);
  };

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  const runningSession = sessions.find((session) => session.status === "RUNNING");

  const handleStartSession = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await apiRequest("/api/sessions", {
        method: "POST",
        body: {
          subject: form.subject,
          year: Number(form.year),
          semester: Number(form.semester),
          section: form.section,
        },
      });
      setForm({ subject: "", year: "", semester: "", section: "" });
      await loadData();
      setMessage("Session started. Matching students were added as absent.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEndSession = async () => {
    if (!runningSession) return;
    setBusy(true);
    try {
      await apiRequest(`/api/sessions/${runningSession.sessionId}/end`, {
        method: "POST",
      });
      await loadData();
      setMessage("Session ended.");
    } catch (error) {
      setMessage(error.message);
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
            Welcome back, {user?.name}. Start a session to begin attendance.
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
            <h2>{students.length}</h2>
            <Link to="/students" className="dashboard-nav-button">
              View Students
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon present-icon">✓</div>
          <div className="stat-info">
            <p>Sessions</p>
            <h2>{sessions.length}</h2>
            <span className="stat-positive">
              {runningSession ? "One session running" : "No live session"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon absent-icon">✕</div>
          <div className="stat-info">
            <p>Your Role</p>
            <h2>{user?.role === "ADMIN" ? "Admin" : "Teacher"}</h2>
            <span>{user?.department || "—"}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accuracy-icon">◎</div>
          <div className="stat-info">
            <p>Late After</p>
            <h2>15m</h2>
            <span className="stat-positive">From session start</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="attendance-card">
          <div className="card-header">
            <div>
              <h2>Start Attendance Session</h2>
              <p>Select subject, year, semester, and section.</p>
            </div>
          </div>

          {runningSession ? (
            <div className="attendance-details">
              <p>
                Live session: <strong>{runningSession.subject}</strong> · Year{" "}
                {runningSession.year} · Sem {runningSession.semester} · Sec{" "}
                {runningSession.section}
              </p>
              <button
                className="view-button"
                type="button"
                onClick={handleEndSession}
                disabled={busy}
              >
                End Session
              </button>
            </div>
          ) : (
            <form className="session-form" onSubmit={handleStartSession}>
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
              <input
                placeholder="Year"
                type="number"
                min="1"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
              />
              <input
                placeholder="Semester"
                type="number"
                min="1"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                required
              />
              <input
                placeholder="Section"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                required
              />
              <button className="view-button" type="submit" disabled={busy}>
                {busy ? "Starting..." : "Start Session"}
              </button>
            </form>
          )}

          {message && <p className="dashboard-description">{message}</p>}
        </div>

        <div className="activity-card">
          <div className="card-header">
            <div>
              <h2>Recent Sessions</h2>
              <p>Latest attendance sessions</p>
            </div>
            <Link to="/attendance" className="view-button">
              View Details
            </Link>
          </div>

          <div className="activity-list">
            {sessions.slice(0, 6).map((session) => (
              <div className="activity-item" key={session.sessionId}>
                <div className="activity-avatar">
                  {session.subject.slice(0, 2).toUpperCase()}
                </div>
                <div className="activity-info">
                  <strong>{session.subject}</strong>
                  <p>
                    Year {session.year} · Sem {session.semester} · Sec{" "}
                    {session.section} · {session.status}
                  </p>
                </div>
                <span className="activity-time">
                  {new Date(session.startedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="dashboard-description">No sessions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
