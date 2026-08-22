import "./Students.css";

function Students() {
  return (
    <div className="students-page">
      {/* Page Header */}
      <div className="students-header">
        <div>
          <p className="students-subtitle">Management</p>
          <h1>Students</h1>
          <p className="students-description">
            Manage student profiles and attendance information.
          </p>
        </div>

        <button className="add-student-button">
          <span>+</span>
          Add Student
        </button>
      </div>

      {/* Statistics */}
      <div className="student-stats">
        <div className="student-stat-card">
          <div className="student-stat-icon total-icon">👥</div>
          <div>
            <p>Total Students</p>
            <h2>120</h2>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon active-icon">✓</div>
          <div>
            <p>Active Students</p>
            <h2>116</h2>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon inactive-icon">−</div>
          <div>
            <p>Inactive Students</p>
            <h2>4</h2>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon class-icon">▦</div>
          <div>
            <p>Total Classes</p>
            <h2>6</h2>
          </div>
        </div>
      </div>

      {/* Students Table Card */}
      <div className="students-table-card">
        <div className="students-table-header">
          <div>
            <h2>Student List</h2>
            <p>View and manage all registered students.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="students-toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search students..."
            />
          </div>

          <select className="class-filter">
            <option value="">All Classes</option>
            <option value="cse-a">CSE A</option>
            <option value="cse-b">CSE B</option>
            <option value="eee-a">EEE A</option>
            <option value="eee-b">EEE B</option>
          </select>

          <select className="status-filter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Class</th>
                <th>Email</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <div className="student-profile">
                    <div className="student-avatar">AR</div>
                    <div>
                      <strong>Ahmed Rahman</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-001</td>
                <td>CSE A</td>
                <td>ahmed@example.com</td>

                <td>
                  <div className="attendance-cell">
                    <strong>92%</strong>
                    <div className="attendance-bar">
                      <div
                        className="attendance-progress"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="status-badge active">Active</span>
                </td>

                <td>
                  <button className="action-button">•••</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="student-profile">
                    <div className="student-avatar">NS</div>
                    <div>
                      <strong>Nusrat Sultana</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-002</td>
                <td>CSE A</td>
                <td>nusrat@example.com</td>

                <td>
                  <div className="attendance-cell">
                    <strong>88%</strong>
                    <div className="attendance-bar">
                      <div
                        className="attendance-progress"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="status-badge active">Active</span>
                </td>

                <td>
                  <button className="action-button">•••</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="student-profile">
                    <div className="student-avatar">RH</div>
                    <div>
                      <strong>Rakib Hasan</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-003</td>
                <td>CSE B</td>
                <td>rakib@example.com</td>

                <td>
                  <div className="attendance-cell">
                    <strong>76%</strong>
                    <div className="attendance-bar">
                      <div
                        className="attendance-progress"
                        style={{ width: "76%" }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="status-badge active">Active</span>
                </td>

                <td>
                  <button className="action-button">•••</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="student-profile">
                    <div className="student-avatar">FA</div>
                    <div>
                      <strong>Fatima Akter</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-004</td>
                <td>CSE B</td>
                <td>fatima@example.com</td>

                <td>
                  <div className="attendance-cell">
                    <strong>95%</strong>
                    <div className="attendance-bar">
                      <div
                        className="attendance-progress"
                        style={{ width: "95%" }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="status-badge active">Active</span>
                </td>

                <td>
                  <button className="action-button">•••</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="student-profile">
                    <div className="student-avatar">MK</div>
                    <div>
                      <strong>Mahin Khan</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-005</td>
                <td>CSE A</td>
                <td>mahin@example.com</td>

                <td>
                  <div className="attendance-cell">
                    <strong>64%</strong>
                    <div className="attendance-bar">
                      <div
                        className="attendance-progress"
                        style={{ width: "64%" }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="status-badge inactive">Inactive</span>
                </td>

                <td>
                  <button className="action-button">•••</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="students-pagination">
          <p>
            Showing <strong>1–5</strong> of <strong>120</strong> students
          </p>

          <div className="pagination-buttons">
            <button disabled>‹</button>
            <button className="current-page">1</button>
            <button>2</button>
            <button>3</button>
            <button>...</button>
            <button>24</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Students;