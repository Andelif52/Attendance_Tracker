import "./Reports.css";
import { useEffect, useMemo, useState } from "react";
import { listSessions } from "../api/attendance";
import { listCourses } from "../api/courses";

function Reports() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Filters
  const [courseFilter, setCourseFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [sessionsList, coursesData] = await Promise.all([
        listSessions({ limit: 200 }).catch(() => []),
        listCourses().catch(() => ({ courses: [] })),
      ]);
      setSessions(Array.isArray(sessionsList) ? sessionsList : []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setMessage(err.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const courseName = (courseId) =>
    courses.find((c) => c.course_id === courseId)?.course_name || courseId;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (courseFilter !== "all" && s.course_id !== courseFilter) return false;
      if (fromDate && s.session_date < fromDate) return false;
      if (toDate && s.session_date > toDate) return false;
      return true;
    });
  }, [sessions, courseFilter, fromDate, toDate]);

  // Aggregate stats across the filtered sessions
  const totals = useMemo(() => {
    return filteredSessions.reduce(
      (acc, s) => {
        const present = s.present_count || 0;
        const late = s.late_count || 0;
        const absent = s.absent_count || 0;
        acc.present += present;
        acc.late += late;
        acc.absent += absent;
        acc.marked += present + late + absent;
        return acc;
      },
      { present: 0, late: 0, absent: 0, marked: 0 }
    );
  }, [filteredSessions]);

  const attendanceRate = totals.marked
    ? Math.round(((totals.present + totals.late) / totals.marked) * 100)
    : 0;

  const handleReset = () => {
    setCourseFilter("all");
    setFromDate("");
    setToDate("");
  };

  const handleExport = () => {
    const header = "Date,Course,Session ID,Status,Present,Late,Absent,Attendance Rate\n";
    const rows = filteredSessions
      .map((s) => {
        const marked = (s.present_count || 0) + (s.late_count || 0) + (s.absent_count || 0);
        const rate = marked
          ? Math.round((((s.present_count || 0) + (s.late_count || 0)) / marked) * 100)
          : 0;
        return [
          s.session_date,
          courseName(s.course_id),
          s.session_id,
          s.status,
          s.present_count || 0,
          s.late_count || 0,
          s.absent_count || 0,
          `${rate}%`,
        ].join(",");
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <p className="reports-subtitle">Attendance Overview</p>
          <h1>Reports</h1>
          <p className="reports-description">
            Session-by-session attendance summary. Filter by course or date to review trends.
          </p>
        </div>

        <button className="reports-export-button" type="button" onClick={handleExport}>
          ⭳ Export CSV
        </button>
      </div>

      {message && <p className="reports-error">{message}</p>}

      {/* Filters */}
      <div className="reports-toolbar">
        <div className="reports-filter-wrapper">
          <label>Course</label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name} ({c.course_code})
              </option>
            ))}
          </select>
        </div>

        <div className="reports-filter-wrapper">
          <label>From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="reports-filter-wrapper">
          <label>To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <button className="reports-reset-button" type="button" onClick={handleReset}>
          Reset
        </button>

        <button className="reports-reset-button" type="button" onClick={loadData}>
          ↻ Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="reports-stats">
        <div className="reports-stat-card">
          <div className="reports-stat-icon overall-stat-icon">◎</div>
          <div>
            <p>Sessions</p>
            <h2>{filteredSessions.length}</h2>
          </div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-icon present-stat-icon">✓</div>
          <div>
            <p>Present</p>
            <h2>{totals.present}</h2>
          </div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-icon late-stat-icon">◷</div>
          <div>
            <p>Late</p>
            <h2>{totals.late}</h2>
          </div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-icon absent-stat-icon">✕</div>
          <div>
            <p>Absent</p>
            <h2>{totals.absent}</h2>
          </div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-icon rate-stat-icon">%</div>
          <div>
            <p>Attendance Rate</p>
            <h2>{attendanceRate}%</h2>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="reports-card">
        <div className="reports-card-header">
          <h2>Session Reports</h2>
          <p>
            {loading
              ? "Loading sessions..."
              : `${filteredSessions.length} session${filteredSessions.length === 1 ? "" : "s"} found`}
          </p>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Session ID</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((s) => {
                const marked = (s.present_count || 0) + (s.late_count || 0) + (s.absent_count || 0);
                const rate = marked
                  ? Math.round((((s.present_count || 0) + (s.late_count || 0)) / marked) * 100)
                  : 0;
                return (
                  <tr key={s.session_id}>
                    <td>{s.session_date}</td>
                    <td>{courseName(s.course_id)}</td>
                    <td>
                      <code>#{s.session_id.slice(-6)}</code>
                    </td>
                    <td>{s.present_count || 0}</td>
                    <td>{s.late_count || 0}</td>
                    <td>{s.absent_count || 0}</td>
                    <td className="reports-percentage">{rate}%</td>
                    <td>
                      <span className={`reports-status ${(s.status || "").toLowerCase()}`}>
                        <span></span>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="reports-empty">
                    No sessions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
