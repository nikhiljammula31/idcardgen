import React from 'react';

function AdminDashboard({
  students = [],
  onNavigate,
  onOpenAddModal
}) {
  const totalStudents = students.length;
  const activeIds = students.filter(
    (s) => (s.status || 'ACTIVE') !== 'REVOKED'
  ).length;
  const revokedIds = students.filter(
    (s) => s.status === 'REVOKED'
  ).length;

  return (
    <div className="admin-page-container">
      <header className="admin-section-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Student ID credential management and system overview</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-admin-primary"
            onClick={onOpenAddModal}
          >
            + Add Student
          </button>
          <button
            className="btn-admin-secondary"
            onClick={() => onNavigate('/admin/students')}
          >
            Manage Students →
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">TOTAL STUDENTS</span>
          <span className="stat-value">{totalStudents}</span>
          <span className="stat-sub">Registered student records</span>
        </div>

        <div className="stat-card stat-active">
          <span className="stat-label">ACTIVE IDS</span>
          <span className="stat-value">{activeIds}</span>
          <span className="stat-sub">Valid credentials</span>
        </div>

        <div className="stat-card stat-revoked">
          <span className="stat-label">REVOKED IDS</span>
          <span className="stat-value">{revokedIds}</span>
          <span className="stat-sub">Suspended credentials</span>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="admin-overview-panel">
        <div className="panel-title-row">
          <h3>Recent Students</h3>
          <button
            className="btn-link"
            onClick={() => onNavigate('/admin/students')}
          >
            View all ({totalStudents})
          </button>
        </div>

        {students.length === 0 ? (
          <p className="empty-text">No students currently registered.</p>
        ) : (
          <div className="recent-students-list">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="recent-student-row">
                <div className="recent-student-info">
                  <img
                    src={student.photo || '/avatar-placeholder.png'}
                    alt={student.fullName}
                    className="avatar-img-sm"
                    onError={(e) => {
                      e.target.src =
                        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                    }}
                  />
                  <div>
                    <strong>{student.fullName}</strong>
                    <span>Roll: {student.rollNo} • {student.department}</span>
                  </div>
                </div>
                <div className="recent-student-meta">
                  <span
                    className={`status-badge ${
                      student.status === 'REVOKED'
                        ? 'status-revoked'
                        : 'status-active'
                    }`}
                  >
                    [ {student.status === 'REVOKED' ? 'REVOKED' : 'ACTIVE'} ]
                  </span>
                  <button
                    className="btn-action btn-sm"
                    onClick={() => onNavigate('/admin/students')}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
