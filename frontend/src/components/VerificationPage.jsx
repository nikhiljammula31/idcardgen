import React, { useEffect, useState } from 'react';

function VerificationPage({
  cardId,
  apiBaseUrl = ''
}) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCard = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${apiBaseUrl}/api/cards/${encodeURIComponent(cardId)}`
        );

        if (!response.ok) {
          throw new Error(
            'Student ID card not found.'
          );
        }

        const data = await response.json();

        setCard(data);
      } catch (err) {
        setError(
          err.message ||
          'Unable to verify this ID card.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [cardId, apiBaseUrl]);

  if (loading) {
    return (
      <div className="verification-page">
        <div className="verification-card">
          <h1>
            Verifying ID Card
          </h1>

          <p>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="verification-page">
        <div className="verification-card invalid">
          <div className="verification-icon">
            ✕
          </div>

          <h1>
            Invalid ID Card
          </h1>

          <p>
            {error ||
              'The student record could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-header">
          <img
            src="/vignans-logo.png"
            alt="Vignan's University"
          />

          <div>
            <h1>
              VIGNAN&apos;S UNIVERSITY
            </h1>

            <p>
              STUDENT ID VERIFICATION
            </p>
          </div>
        </div>

        {card.status === 'REVOKED' ? (
          <div className="verified-badge revoked-badge">
            ⚠ ID CARD REVOKED
          </div>
        ) : (
          <div className="verified-badge">
            ✓ VERIFIED IDENTITY
          </div>
        )}

        <div className="verification-body">

          <div className="verification-photo">
            {card.photo ? (
              <img
                src={card.photo}
                alt={card.fullName}
              />
            ) : (
              <div className="no-photo">
                No Photo
              </div>
            )}
          </div>

          <div className="verification-details">

            <h2>
              {card.fullName}
            </h2>

            <p className="verification-course">
              {card.department}
            </p>

            <div className="detail-row">
              <span>
                Roll / ID
              </span>

              <strong>
                {card.rollNo}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                Batch
              </span>

              <strong>
                {card.batch}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                Blood Group
              </span>

              <strong>
                {card.bloodGroup ||
                  'Not provided'}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                Student Type
              </span>

              <strong>
                {card.residenceType ||
                  'Not provided'}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                Contact
              </span>

              <strong>
                {card.phoneNumber ||
                  'Not provided'}
              </strong>
            </div>

          </div>
        </div>

        <div className="verification-footer">
          <span>
            Verification ID
          </span>

          <strong>
            {card.id}
          </strong>
        </div>

        <p className="verification-note">
          This student identity has been
          verified against the ID Card
          database.
        </p>

      </div>
    </div>
  );
}

export default VerificationPage;