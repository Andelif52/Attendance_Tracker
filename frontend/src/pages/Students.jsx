import "./Students.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { listStudents, createStudent } from "../api/students";
import { enrollFace, deleteEnrollment } from "../api/faces";

const emptyForm = {
  name: "",
  student_id: "",
  department: "CSE",
  batch: "",
  email: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Face Enrollment Modal state
  const [enrollingStudent, setEnrollingStudent] = useState(null);
  const [enrollMode, setEnrollMode] = useState("camera"); // "camera" | "upload"
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [enrollMessage, setEnrollMessage] = useState("");
  const [enrollBusy, setEnrollBusy] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const loadStudents = async () => {
    try {
      const payload = await listStudents();
      setStudents(payload.students || []);
    } catch (error) {
      setMessage(error.message || "Failed to load students from Firestore.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (student.name || "").toLowerCase().includes(q) ||
        (student.student_id || "").toLowerCase().includes(q) ||
        (student.email || "").toLowerCase().includes(q);

      const matchesDept =
        !deptFilter || (student.department || "").toLowerCase() === deptFilter.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [students, search, deptFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await createStudent({
        student_id: form.student_id.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        batch: form.batch.trim(),
        email: form.email.trim(),
      });
      setForm(emptyForm);
      setShowAddModal(false);
      setMessage(`Student ${form.name} created successfully.`);
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not create student.");
    } finally {
      setBusy(false);
    }
  };

  // --- Face Enrollment Camera Controls ---
  const startCamera = async () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setEnrollMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setEnrollMessage(`Camera access denied or unavailable: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      setCapturedPreview(URL.createObjectURL(file));
      setEnrollMessage("");
    }
  };

  const handleEnrollSubmit = async () => {
    if (!enrollingStudent || !capturedBlob) {
      setEnrollMessage("Please take a photo or select an image file first.");
      return;
    }

    setEnrollBusy(true);
    setEnrollMessage("Uploading to AI pipeline...");

    try {
      const res = await enrollFace(enrollingStudent.student_id, capturedBlob);
      setEnrollMessage(`Success: ${res.message} (Quality score: ${(res.quality * 100).toFixed(0)}%)`);
      await loadStudents();
      setTimeout(() => {
        closeEnrollModal();
      }, 1500);
    } catch (err) {
      setEnrollMessage(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrollBusy(false);
    }
  };

  const openEnrollModal = (student) => {
    setEnrollingStudent(student);
    setCapturedBlob(null);
    setCapturedPreview(null);
    setEnrollMessage("");
    setEnrollMode("camera");
  };

  const closeEnrollModal = () => {
    stopCamera();
    setEnrollingStudent(null);
    setCapturedBlob(null);
    setCapturedPreview(null);
    setEnrollMessage("");
  };

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <p className="students-subtitle">Database Records</p>
          <h1>Students Management</h1>
          <p className="students-description">
            Enrolled students in Firebase Firestore used by the AI face recognition system.
          </p>
        </div>

        <button
          className="add-student-button"
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ background: "#CB2957" }}
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
          <div className="student-stat-icon active-icon">📷</div>
          <div>
            <p>Faces Enrolled</p>
            <h2>{students.filter((s) => s.face_enrolled).length}</h2>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon class-icon">🏛</div>
          <div>
            <p>Departments</p>
            <h2>{departments.length}</h2>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon inactive-icon">▦</div>
          <div>
            <p>Filtered List</p>
            <h2>{filtered.length}</h2>
          </div>
        </div>
      </div>

      {message && (
        <p
          className="students-description"
          style={{
            margin: "12px 0",
            fontWeight: 600,
            color: message.includes("success") ? "#15803d" : "#CB2957",
          }}
        >
          {message}
        </p>
      )}

      {/* Student List Card */}
      <div className="students-table-card">
        <div className="students-table-header">
          <div>
            <h2>Enrolled Students</h2>
            <p>Students eligible for AI attendance recognition sessions</p>
          </div>
        </div>

        <div className="students-toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="class-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Face Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.student_id}>
                  <td>
                    <div className="student-profile">
                      <div className="student-avatar">
                        {(student.name || "ST").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{student.name}</strong>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontWeight: 600, color: "#111827" }}>{student.student_id}</code>
                  </td>
                  <td>{student.department}</td>
                  <td>{student.batch || "—"}</td>
                  <td>
                    {student.face_enrolled ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#dcfce7",
                          color: "#15803d",
                        }}
                      >
                        ✓ Enrolled
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#fee2e2",
                          color: "#b91c1c",
                        }}
                      >
                        ✕ Not Enrolled
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openEnrollModal(student)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #CB2957",
                        background: student.face_enrolled ? "#ffffff" : "#CB2957",
                        color: student.face_enrolled ? "#CB2957" : "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {student.face_enrolled ? "Re-enroll Face" : "Enroll Face"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No students matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD STUDENT MODAL ================= */}
      {showAddModal && (
        <div
          className="auth-overlay"
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "28px",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2>Add New Student</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600 }}>Student ID</label>
                <input
                  placeholder="e.g. 202401001"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600 }}>Full Name</label>
                <input
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  placeholder="e.g. student@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Department</label>
                  <input
                    placeholder="e.g. CSE"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Batch / Section</label>
                  <input
                    placeholder="e.g. 24"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#f1f5f9" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#CB2957",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  {busy ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FACE ENROLLMENT MODAL ================= */}
      {enrollingStudent && (
        <div
          className="auth-overlay"
          onClick={closeEnrollModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px" }}>Enroll Face Embedding</h2>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
                  Student: <strong>{enrollingStudent.name}</strong> (ID: {enrollingStudent.student_id})
                </p>
              </div>
              <button
                type="button"
                onClick={closeEnrollModal}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Mode selection tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  setEnrollMode("camera");
                  setCapturedBlob(null);
                  setCapturedPreview(null);
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: enrollMode === "camera" ? "#CB2957" : "#ccc",
                  background: enrollMode === "camera" ? "#fdf2f4" : "#fff",
                  color: enrollMode === "camera" ? "#CB2957" : "#333",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📷 Web Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setEnrollMode("upload");
                  setCapturedBlob(null);
                  setCapturedPreview(null);
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: enrollMode === "upload" ? "#CB2957" : "#ccc",
                  background: enrollMode === "upload" ? "#fdf2f4" : "#fff",
                  color: enrollMode === "upload" ? "#CB2957" : "#333",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📁 Upload Photo
              </button>
            </div>

            {/* Camera Viewport */}
            {enrollMode === "camera" && (
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "280px",
                    background: "#000",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {capturedPreview ? (
                    <img
                      src={capturedPreview}
                      alt="Captured Face"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                  )}

                  {!cameraActive && !capturedPreview && (
                    <div style={{ color: "#aaa" }}>
                      <p>Camera is currently off</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#CB2957",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                  {cameraActive && (
                    <>
                      <button
                        type="button"
                        onClick={captureFrame}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#15803d",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        📸 Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          background: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Stop Camera
                      </button>
                    </>
                  )}

                  {capturedPreview && (
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background: "#f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      Retake Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* File Upload Viewport */}
            {enrollMode === "upload" && (
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div
                  style={{
                    border: "2px dashed #ccc",
                    padding: "24px",
                    borderRadius: "8px",
                    background: "#fafafa",
                  }}
                >
                  {capturedPreview ? (
                    <img
                      src={capturedPreview}
                      alt="Uploaded Preview"
                      style={{ maxWidth: "100%", maxHeight: "220px", borderRadius: "6px" }}
                    />
                  ) : (
                    <div>
                      <p style={{ margin: "0 0 10px", color: "#64748b" }}>Select a clear frontal photo of the student.</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ margin: "0 auto" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {enrollMessage && (
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: enrollMessage.includes("Success") ? "#15803d" : "#CB2957",
                  textAlign: "center",
                  margin: "8px 0",
                }}
              >
                {enrollMessage}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={closeEnrollModal}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#f1f5f9" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEnrollSubmit}
                disabled={!capturedBlob || enrollBusy}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#CB2957",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: capturedBlob && !enrollBusy ? "pointer" : "not-allowed",
                  opacity: capturedBlob && !enrollBusy ? 1 : 0.6,
                }}
              >
                {enrollBusy ? "Processing..." : "Enroll Face"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;

