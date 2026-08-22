import "./Attendance.css";

function Attendance() {
  return (
    <div className="attendance-page">
      {/* Page Header */}
      <div className="attendance-header">
        <div>
          <p className="attendance-subtitle">Records</p>
          <h1>Attendance</h1>
          <p className="attendance-description">
            Monitor and manage student attendance records.
          </p>
        </div>

        <button className="export-button">
          <span>↓</span>
          Export Report
        </button>
      </div>

      {/* Statistics */}
      <div className="attendance-stats">
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon present-stat-icon">✓</div>
          <div>
            <p>Present Today</p>
            <h2>96</h2>
            <span className="stat-green">80% of students</span>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon absent-stat-icon">✕</div>
          <div>
            <p>Absent Today</p>
            <h2>16</h2>
            <span className="stat-red">13.3% of students</span>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon late-stat-icon">◷</div>
          <div>
            <p>Late Today</p>
            <h2>8</h2>
            <span className="stat-orange">6.7% of students</span>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon overall-stat-icon">◎</div>
          <div>
            <p>Overall Attendance</p>
            <h2>89.4%</h2>
            <span className="stat-green">+2.1% this month</span>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="attendance-card">
        <div className="attendance-card-header">
          <div>
            <h2>Attendance Records</h2>
            <p>Daily attendance captured by the AI recognition system.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="attendance-toolbar">
          <div className="attendance-search">
            <span className="attendance-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search student..."
            />
          </div>

          <div className="date-wrapper">
            <label>Date</label>
            <input
              type="date"
              defaultValue="2026-08-22"
            />
          </div>

          <div className="attendance-filter-wrapper">
            <label>Class</label>
            <select>
              <option value="">All Classes</option>
              <option value="cse-a">CSE A</option>
              <option value="cse-b">CSE B</option>
              <option value="eee-a">EEE A</option>
              <option value="eee-b">EEE B</option>
            </select>
          </div>

          <div className="attendance-filter-wrapper">
            <label>Status</label>
            <select>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Class</th>
                <th>Check-in Time</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>Confidence</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">AR</div>
                    <div>
                      <strong>Ahmed Rahman</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-001</td>
                <td>CSE A</td>

                <td>
                  <span className="check-in-time">09:52 AM</span>
                </td>

                <td>
                  <span className="attendance-status present">
                    <span></span>
                    Present
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">92%</span>
                </td>

                <td>
                  <div className="confidence">
                    <span>98.7%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-progress"
                        style={{ width: "98.7%" }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">NS</div>
                    <div>
                      <strong>Nusrat Sultana</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-002</td>
                <td>CSE A</td>

                <td>
                  <span className="check-in-time">09:54 AM</span>
                </td>

                <td>
                  <span className="attendance-status present">
                    <span></span>
                    Present
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">88%</span>
                </td>

                <td>
                  <div className="confidence">
                    <span>97.4%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-progress"
                        style={{ width: "97.4%" }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">RH</div>
                    <div>
                      <strong>Rakib Hasan</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-003</td>
                <td>CSE B</td>

                <td>
                  <span className="check-in-time">10:08 AM</span>
                </td>

                <td>
                  <span className="attendance-status late">
                    <span></span>
                    Late
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">76%</span>
                </td>

                <td>
                  <div className="confidence">
                    <span>96.2%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-progress"
                        style={{ width: "96.2%" }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">FA</div>
                    <div>
                      <strong>Fatima Akter</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-004</td>
                <td>CSE B</td>

                <td>
                  <span className="check-in-time">09:49 AM</span>
                </td>

                <td>
                  <span className="attendance-status present">
                    <span></span>
                    Present
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">95%</span>
                </td>

                <td>
                  <div className="confidence">
                    <span>99.1%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-progress"
                        style={{ width: "99.1%" }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">MK</div>
                    <div>
                      <strong>Mahin Khan</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-005</td>
                <td>CSE A</td>

                <td>
                  <span className="check-in-time">—</span>
                </td>

                <td>
                  <span className="attendance-status absent">
                    <span></span>
                    Absent
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">64%</span>
                </td>

                <td>
                  <span className="not-detected">Not detected</span>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="attendance-student">
                    <div className="attendance-avatar">SA</div>
                    <div>
                      <strong>Sumaiya Ahmed</strong>
                      <span>Computer Science</span>
                    </div>
                  </div>
                </td>

                <td>2022-01-006</td>
                <td>CSE A</td>

                <td>
                  <span className="check-in-time">09:57 AM</span>
                </td>

                <td>
                  <span className="attendance-status present">
                    <span></span>
                    Present
                  </span>
                </td>

                <td>
                  <span className="attendance-percentage">91%</span>
                </td>

                <td>
                  <div className="confidence">
                    <span>98.1%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-progress"
                        style={{ width: "98.1%" }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="attendance-pagination">
          <p>
            Showing <strong>1–6</strong> of <strong>120</strong> students
          </p>

          <div className="attendance-pagination-buttons">
            <button disabled>‹</button>
            <button className="current-page">1</button>
            <button>2</button>
            <button>3</button>
            <button>...</button>
            <button>20</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* AI System Status */}
      <div className="ai-status">
        <div className="ai-status-left">
          <div className="ai-status-icon">◎</div>

          <div>
            <strong>AI Recognition Active</strong>
            <p>
              Attendance is being automatically recorded through face
              recognition.
            </p>
          </div>
        </div>

        <span className="ai-status-live">
          <span></span>
          Live
        </span>
      </div>
    </div>
  );
}

export default Attendance;