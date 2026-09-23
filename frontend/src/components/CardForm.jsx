import React, { useState } from 'react';

function CardForm({
  formData,
  handleChange,
  handleImageUpload,
  handleReset,
  handleSave,
  isAdmin,
  onCancel
}) {
  const [step, setStep] = useState(1);

  const handleNext = (e) => {
    if (e) e.preventDefault();

    if (!formData.fullName || !formData.fullName.trim()) {
      alert('Please enter Full Name.');
      return;
    }
    if (!formData.rollNo || !formData.rollNo.trim()) {
      alert('Please enter Roll / ID Number.');
      return;
    }
    if (!formData.collegeName || !formData.collegeName.trim()) {
      alert('Please enter College / University Name.');
      return;
    }
    if (!formData.department || !formData.department.trim()) {
      alert('Please enter Course / Department.');
      return;
    }
    if (!formData.batch || !formData.batch.trim()) {
      alert('Please enter Academic Year / Batch.');
      return;
    }
    if (!formData.residenceType || !formData.residenceType.trim()) {
      alert('Please select Residence / Student Type (Day Scholar or Hostler).');
      return;
    }

    setStep(2);
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2) {
      handleNext();
    }
  };

  const onResetClick = (e) => {
    if (handleReset) handleReset(e);
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      handleNext(e);
      return;
    }
    if (handleSave) {
      handleSave(e);
    }
  };

  return (
    <div className="form-card">
      <h2>
        {isAdmin
          ? formData.id
            ? "Edit Student Record"
            : "Add New Student"
          : "Academic Details Form"}
      </h2>

      {/* 2-Step Multi-Step Progress Indicator */}
      <div className="form-steps-bar" role="tablist" aria-label="Form Steps">
        <button
          type="button"
          className={`step-indicator-btn ${step === 1 ? 'active' : 'completed'}`}
          onClick={() => handleStepClick(1)}
          aria-selected={step === 1}
          role="tab"
        >
          <span className="step-dot">{step > 1 ? '✓' : '1'}</span>
          <span className="step-title">Front Details</span>
        </button>
        <div className={`step-divider-line ${step === 2 ? 'active' : ''}`} />
        <button
          type="button"
          className={`step-indicator-btn ${step === 2 ? 'active' : ''}`}
          onClick={() => handleStepClick(2)}
          aria-selected={step === 2}
          role="tab"
        >
          <span className="step-dot">2</span>
          <span className="step-title">Back Details</span>
        </button>
      </div>

      <div className="step-section-heading">
        <span className="step-badge">Step {step} of 2</span>
        <span className="step-heading-text">
          {step === 1 ? "Front Side Information" : "Back Side Information"}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: FRONT SIDE DETAILS */}
        {step === 1 && (
          <div className="step-content step-1-content">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll / ID Number</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo || ''}
                  onChange={handleChange}
                  placeholder="e.g. 241FA04C06"
                  required
                />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup || ''}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>College / University Name</label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName || "Vignan's University"}
                onChange={handleChange}
                placeholder="e.g. Vignan's University"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course / Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech CSE"
                  required
                />
              </div>
              <div className="form-group">
                <label>Academic Year / Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch || ''}
                  onChange={handleChange}
                  placeholder="e.g. 2024 - 2028"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  maxLength="15"
                />
              </div>
              <div className="form-group">
                <label>Residence / Student Type</label>
                <select
                  name="residenceType"
                  value={
                    formData.residenceType === 'Hosteller'
                      ? 'Hostler'
                      : (formData.residenceType || '')
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Student Type</option>
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hostler">Hostler</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn-next"
                onClick={handleNext}
              >
                Next →
              </button>
              {onCancel ? (
                <button type="button" className="btn-reset" onClick={onCancel}>
                  Cancel
                </button>
              ) : (
                <button type="button" className="btn-reset" onClick={onResetClick}>
                  Clear Form
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: BACK SIDE DETAILS */}
        {step === 2 && (
          <div className="step-content step-2-content">
            <div className="form-group">
              <label>Father Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName || ''}
                onChange={handleChange}
                placeholder="e.g. JAMMULA ARUNA BABU"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="e.g. # Vijayapuri Colony 4th Line, Teja Grand - 302, Guntur."
              />
            </div>

            {isAdmin && (
              <div className="form-group">
                <label>ID Status</label>
                <select
                  name="status"
                  value={formData.status || 'ACTIVE'}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="REVOKED">REVOKED</option>
                </select>
              </div>
            )}

            <div className="button-group">
              <button
                type="button"
                className="btn-back"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button type="submit" className="btn-save">
                {isAdmin
                  ? "💾 Save / Update Database"
                  : "💾 Save / Generate ID Card"}
              </button>
              {onCancel ? (
                <button type="button" className="btn-reset" onClick={onCancel}>
                  Cancel
                </button>
              ) : (
                <button type="button" className="btn-reset" onClick={onResetClick}>
                  Clear Form
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default CardForm;
