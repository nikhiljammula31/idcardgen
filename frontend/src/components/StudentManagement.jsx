import React, { useState } from 'react';
import CardForm from './CardForm';
import { downloadCardAsPng } from './CardPreview';

function StudentManagement({
  students = [],
  onRefresh,
  apiBaseUrl = '',
  onShowMessage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [confirmReactivate, setConfirmReactivate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter students by Name, Roll No, or Card ID
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const name = (student.fullName || '').toLowerCase();
    const roll = (student.rollNo || '').toLowerCase();
    const id = (student.id || '').toLowerCase();
    return name.includes(term) || roll.includes(term) || id.includes(term);
  });

  // Handle Edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingStudent((prev) => ({
        ...prev,
        photo: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save edited student
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent.fullName || !editingStudent.rollNo) {
      onShowMessage('Student Name and Roll Number are required.', 'error');
      return;
    }

    if (!editingStudent.residenceType) {
      onShowMessage('Please select a Residence / Student Type (Day Scholar or Hostler).', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/cards/${encodeURIComponent(editingStudent.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingStudent)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update student record on backend.');
      }

      onShowMessage('Student updated successfully.', 'success');
      setEditingStudent(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      onShowMessage(err.message || 'Failed to update student.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete student
  const handleDelete = async () => {
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/cards/${encodeURIComponent(confirmDelete.id)}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete student.');
      }

      onShowMessage('Student deleted successfully.', 'success');
      setConfirmDelete(null);
      if (viewingStudent?.id === confirmDelete.id) {
        setViewingStudent(null);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      onShowMessage(err.message || 'Failed to delete student.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Revoke ID status
  const handleRevoke = async () => {
    if (!confirmRevoke) return;

    setIsProcessing(true);
    try {
      const updatedData = {
        ...confirmRevoke,
        status: 'REVOKED'
      };

      const response = await fetch(
        `${apiBaseUrl}/api/cards/${encodeURIComponent(confirmRevoke.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to revoke student ID.');
      }

      onShowMessage('ID revoked successfully.', 'success');
      setConfirmRevoke(null);
      if (viewingStudent?.id === confirmRevoke.id) {
        setViewingStudent(updatedData);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      onShowMessage(err.message || 'Failed to revoke ID.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reactivate ID status
  const handleReactivate = async () => {
    if (!confirmReactivate) return;

    setIsProcessing(true);
    try {
      const updatedData = {
        ...confirmReactivate,
        status: 'ACTIVE'
      };

      const response = await fetch(
        `${apiBaseUrl}/api/cards/${encodeURIComponent(confirmReactivate.id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate student ID.');
      }

      onShowMessage('ID reactivated successfully.', 'success');
      setConfirmReactivate(null);
      if (viewingStudent?.id === confirmReactivate.id) {
        setViewingStudent(updatedData);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      onShowMessage(err.message || 'Failed to reactivate ID.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download ID card
  const handleDownload = async (student) => {
    try {
      onShowMessage('Preparing ID card for download...', 'info');
      await downloadCardAsPng(student);
      onShowMessage('ID Card downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      onShowMessage(err.message || 'Failed to download ID card.', 'error');
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-section-header">
        <div>
          <h2>Student Management</h2>
          <p>View, update, download, or revoke registered student credentials</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="admin-search-container">
        <input
          type="text"
          className="admin-search-input"
          placeholder="🔍 Search by Full Name, Roll / ID, or Card ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="btn-clear-search"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* Student List Table */}
      <div className="admin-table-wrapper">
        {filteredStudents.length === 0 ? (
          <div className="admin-empty-state">
            <p>No students found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Full Name</th>
                <th>Roll / ID</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isRevoked = student.status === 'REVOKED';
                return (
                  <tr key={student.id}>
                    <td>
                      <img
                        src={student.photo || '/avatar-placeholder.png'}
                        alt={student.fullName}
                        className="avatar-img-table"
                        onError={(e) => {
                          e.target.src =
                            'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                        }}
                      />
                    </td>
                    <td>
                      <strong>{student.fullName}</strong>
                    </td>
                    <td>{student.rollNo}</td>
                    <td>{student.department}</td>
                    <td>{student.batch}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          isRevoked ? 'status-revoked' : 'status-active'
                        }`}
                      >
                        [ {isRevoked ? 'REVOKED' : 'ACTIVE'} ]
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => setViewingStudent(student)}
                        >
                          VIEW
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => setEditingStudent({ ...student })}
                        >
                          EDIT
                        </button>
                        <button
                          className="btn-action btn-download"
                          onClick={() => handleDownload(student)}
                        >
                          DOWNLOAD
                        </button>
                        {isRevoked ? (
                          <button
                            className="btn-action btn-reactivate"
                            onClick={() => setConfirmReactivate(student)}
                          >
                            REACTIVATE ID
                          </button>
                        ) : (
                          <button
                            className="btn-action btn-revoke"
                            onClick={() => setConfirmRevoke(student)}
                          >
                            REVOKE ID
                          </button>
                        )}
                        <button
                          className="btn-action btn-delete"
                          onClick={() => setConfirmDelete(student)}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewingStudent && (
        <div className="modal-backdrop" onClick={() => setViewingStudent(null)}>
          <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button
                className="btn-close-modal"
                onClick={() => setViewingStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-view">
              <div className="view-photo-container">
                <img
                  src={viewingStudent.photo || '/avatar-placeholder.png'}
                  alt={viewingStudent.fullName}
                  className="view-photo"
                  onError={(e) => {
                    e.target.src =
                      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                  }}
                />
                <span
                  className={`status-badge ${
                    viewingStudent.status === 'REVOKED'
                      ? 'status-revoked'
                      : 'status-active'
                  }`}
                >
                  [ {viewingStudent.status === 'REVOKED' ? 'REVOKED' : 'ACTIVE'} ]
                </span>
              </div>

              <div className="view-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <strong className="detail-val">{viewingStudent.fullName}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Roll / ID</span>
                  <strong className="detail-val">{viewingStudent.rollNo}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">College / University</span>
                  <strong className="detail-val">
                    {viewingStudent.collegeName || "Vignan's University"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <strong className="detail-val">{viewingStudent.department}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Batch</span>
                  <strong className="detail-val">{viewingStudent.batch}</strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Blood Group</span>
                  <strong className="detail-val">
                    {viewingStudent.bloodGroup || 'Not provided'}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <strong className="detail-val">
                    {viewingStudent.phoneNumber || 'Not provided'}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Residence Type</span>
                  <strong className="detail-val">
                    {viewingStudent.residenceType || 'Not provided'}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Father Name</span>
                  <strong className="detail-val">
                    {viewingStudent.fatherName || 'Not provided'}
                  </strong>
                </div>

                <div className="detail-item detail-full-width">
                  <span className="detail-label">Address</span>
                  <strong className="detail-val">
                    {viewingStudent.address || 'Not provided'}
                  </strong>
                </div>

                <div className="detail-item detail-full-width">
                  <span className="detail-label">Student ID</span>
                  <strong className="detail-val detail-id-mono">
                    {viewingStudent.id}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-admin-primary"
                onClick={() => {
                  setEditingStudent({ ...viewingStudent });
                  setViewingStudent(null);
                }}
              >
                EDIT
              </button>
              <button
                className="btn-admin-secondary"
                onClick={() => handleDownload(viewingStudent)}
              >
                DOWNLOAD ID
              </button>
              <button
                className="btn-admin-cancel"
                onClick={() => setViewingStudent(null)}
              >
                CLOSE / BACK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="modal-backdrop" onClick={() => setEditingStudent(null)}>
          <div className="modal-content modal-edit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student Information</h3>
              <button
                className="btn-close-modal"
                onClick={() => setEditingStudent(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <CardForm
                formData={editingStudent}
                handleChange={handleEditChange}
                handleImageUpload={handleEditImageUpload}
                handleReset={() => {}}
                handleSave={handleSaveEdit}
                isAdmin={true}
                onCancel={() => setEditingStudent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p className="confirm-text">
              Are you sure you want to permanently delete this student ID record?
            </p>
            <p className="confirm-subtext">
              Student: <strong>{confirmDelete.fullName}</strong> ({confirmDelete.rollNo})
            </p>
            <div className="modal-footer">
              <button
                className="btn-admin-cancel"
                onClick={() => setConfirmDelete(null)}
                disabled={isProcessing}
              >
                CANCEL
              </button>
              <button
                className="btn-admin-danger"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {confirmRevoke && (
        <div className="modal-backdrop" onClick={() => setConfirmRevoke(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Revoke Student ID</h3>
            <p className="confirm-text">
              Are you sure you want to revoke this student ID?
            </p>
            <p className="confirm-subtext">
              Student: <strong>{confirmRevoke.fullName}</strong> ({confirmRevoke.rollNo})
              <br />
              <small>The verification page will show ID CARD REVOKED.</small>
            </p>
            <div className="modal-footer">
              <button
                className="btn-admin-cancel"
                onClick={() => setConfirmRevoke(null)}
                disabled={isProcessing}
              >
                CANCEL
              </button>
              <button
                className="btn-admin-warning"
                onClick={handleRevoke}
                disabled={isProcessing}
              >
                {isProcessing ? 'Revoking...' : 'REVOKE ID'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATE CONFIRMATION MODAL */}
      {confirmReactivate && (
        <div className="modal-backdrop" onClick={() => setConfirmReactivate(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Reactivate Student ID</h3>
            <p className="confirm-text">
              Are you sure you want to reactivate this student ID?
            </p>
            <p className="confirm-subtext">
              Student: <strong>{confirmReactivate.fullName}</strong> ({confirmReactivate.rollNo})
              <br />
              <small>The verification page will show VERIFIED IDENTITY.</small>
            </p>
            <div className="modal-footer">
              <button
                className="btn-admin-cancel"
                onClick={() => setConfirmReactivate(null)}
                disabled={isProcessing}
              >
                CANCEL
              </button>
              <button
                className="btn-admin-primary"
                onClick={handleReactivate}
                disabled={isProcessing}
              >
                {isProcessing ? 'Reactivating...' : 'REACTIVATE ID'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
