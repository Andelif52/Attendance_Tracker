import "./Students.css";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const emptyForm = {
  name: "",
  varsityId: "",
  department: "",
  year: "",
  semester: "",
  section: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStudents = async () => {
    const payload = await apiRequest("/api/students");
    setStudents(payload.data.students);
  };

  useEffect(() => {
    loadStudents().catch((error) => setMessage(error.message));
  }, []);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !search ||
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.varsityId.toLowerCase().includes(search.toLowerCase());
      const matchesClass =
        !classFilter ||
        `${student.department} ${student.section}`.toLowerCase() ===
          classFilter.toLowerCase();
      return matchesSearch && matchesClass;
    });
  }, [students, search, classFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await apiRequest("/api/students", {
        method: "POST",
        body: {
          ...form,
          year: Number(form.year),
          semester: Number(form.semester),
        },
      });
      setForm(emptyForm);
      setShowForm(false);
      await loadStudents();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const departments = [...new Set(students.map((s) => `${s.department} ${s.section}`))];

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <p className="students-subtitle">Management</p>
          <h1>Students</h1>
          <p className="students-description">
            Students are stored in the database for attendance matching. They cannot log in.
          </p>
        </div>

        <button
          className="add-student-button"
          type="button"
          onClick={() => setShowForm((open) => !open)}
        >
          <span>+</span>
          Add Student
        </button>
      </div>

      <div className="student-stats">
        <div className="student-stat-card">
          <div className="student-stat-icon total-icon">👥</div>
          <div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon active-icon">✓</div>
          <div>
            <p>Departments</p>
            <h2>{new Set(students.map((s) => s.department)).size}</h2>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon class-icon">▦</div>
          <div>
            <p>Sections</p>
            <h2>{new Set(students.map((s) => s.section)).size}</h2>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon inactive-icon">−</div>
          <div>
            <p>Showing</p>
            <h2>{filtered.length}</h2>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="students-toolbar" onSubmit={handleCreate}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Varsity ID"
            value={form.varsityId}
            onChange={(e) => setForm({ ...form, varsityId: e.target.value })}
            required
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
          <input
            placeholder="Year"
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            required
          />
          <input
            placeholder="Semester"
            type="number"
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
          <button className="add-student-button" type="submit" disabled={busy}>
            Save
          </button>
        </form>
      )}

      {message && <p className="students-description">{message}</p>}

      <div className="students-table-card">
        <div className="students-table-header">
          <div>
            <h2>Student List</h2>
            <p>Registered students used by face-matching sessions.</p>
          </div>
        </div>

        <div className="students-toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Varsity ID</th>
                <th>Department</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-profile">
                      <div className="student-avatar">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{student.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{student.varsityId}</td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                  <td>{student.semester}</td>
                  <td>{student.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;
