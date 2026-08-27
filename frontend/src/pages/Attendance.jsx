import "./Attendance.css";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [varsityId, setVarsityId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSessions = async () => {
    const payload = await apiRequest("/api/sessions");
    setSessions(payload.data.sessions);
    return payload.data.sessions;
  };

  const loadSession = async (id) => {
    const payload = await apiRequest(`/api/sessions/${id}`);
    setSelected(payload.data.session);
  };

  useEffect(() => {
    loadSessions()
      .then((list) => {
        if (list[0]) {
          return loadSession(list[0].sessionId);
        }
        return null;
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const presentCount =
    selected?.records?.filter((r) => r.attendanceStatus === "PRESENT").length || 0;
  const lateCount =
    selected?.records?.filter((r) => r.attendanceStatus === "LATE").length || 0;
  const absentCount =
    selected?.records?.filter((r) => r.attendanceStatus === "ABSENT").length || 0;

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      await apiRequest(`/api/sessions/${selected.sessionId}/students`, {
        method: "POST",
        body: { varsityId },
      });
      setVarsityId("");
      await loadSession(selected.sessionId);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await apiRequest(`/api/sessions/${selected.sessionId}/end`, {
        method: "POST",
      });
      await loadSessions();
      await loadSession(selected.sessionId);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <p className="attendance-subtitle">Records</p>
          <h1>Attendance</h1>
          <p className="attendance-description">
            Open a session to see each student’s status, time, and late/present marks.
          </p>
        </div>
      </div>

      <div className="attendance-stats">
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon present-stat-icon">✓</div>
          <div>
            <p>Present</p>
            <h2>{presentCount}</h2>
          </div>
        </div>
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon late-stat-icon">◷</div>
          <div>
            <p>Late</p>
            <h2>{lateCount}</h2>
          </div>
        </div>
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon absent-stat-icon">✕</div>
          <div>
            <p>Absent</p>
            <h2>{absentCount}</h2>
          </div>
        </div>
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon overall-stat-icon">◎</div>
          <div>
            <p>Sessions</p>
            <h2>{sessions.length}</h2>
          </div>
        </div>
      </div>

      <div className="attendance-toolbar">
        <div className="attendance-filter-wrapper">
          <label>Session</label>
          <select
            value={selected?.sessionId || ""}
            onChange={(e) => loadSession(Number(e.target.value))}
          >
            {sessions.map((session) => (
              <option key={session.sessionId} value={session.sessionId}>
                #{session.sessionId} {session.subject} · Y{session.year} S
                {session.semester} {session.section} ({session.status})
              </option>
            ))}
          </select>
        </div>

        {selected?.status === "RUNNING" && (
          <>
            <form className="attendance-search" onSubmit={handleAddStudent}>
              <input
                type="text"
                placeholder="Add student by varsity ID"
                value={varsityId}
                onChange={(e) => setVarsityId(e.target.value)}
              />
              <button className="export-button" type="submit" disabled={busy}>
                Add
              </button>
            </form>
            <button className="export-button" type="button" onClick={handleEnd} disabled={busy}>
              End session
            </button>
          </>
        )}
      </div>

      {message && <p className="attendance-description">{message}</p>}

      <div className="attendance-card">
        <div className="attendance-card-header">
          <div>
            <h2>
              {selected
                ? `${selected.subject} · Year ${selected.year} · Sem ${selected.semester} · Sec ${selected.section}`
                : "No session selected"}
            </h2>
            <p>
              {selected
                ? `Started ${new Date(selected.startedAt).toLocaleString()}`
                : "Start a session from the dashboard."}
            </p>
          </div>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Varsity ID</th>
                <th>Section</th>
                <th>Check-in Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(selected?.records || []).map((record) => (
                <tr key={record.recordId}>
                  <td>
                    <div className="attendance-student">
                      <div className="attendance-avatar">
                        {(record.name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{record.name}</strong>
                        <span>{record.department}</span>
                      </div>
                    </div>
                  </td>
                  <td>{record.varsityId}</td>
                  <td>{record.section}</td>
                  <td>
                    <span className="check-in-time">
                      {record.attendedAt
                        ? new Date(record.attendedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`attendance-status ${record.attendanceStatus.toLowerCase()}`}
                    >
                      <span></span>
                      {record.attendanceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
