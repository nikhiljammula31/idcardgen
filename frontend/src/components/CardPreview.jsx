import React, { useState } from 'react';
import Barcode from 'react-barcode';

/*
 * Convert an image URL/file into a data URL
 * so it can be embedded inside the downloaded SVG.
 */
async function imageToDataUrl(src) {
  if (!src) return '';

  if (src.startsWith('data:')) {
    return src;
  }

  const response = await fetch(src);

  if (!response.ok) {
    throw new Error('Unable to load image.');
  }

  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

/*
 * Escape text before putting it inside SVG.
 */
function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/*
 * Generate a real Code 128 barcode as SVG data with native dimensions and quiet zone.
 */
async function generateBarcodeSvg(value) {
  const JsBarcodeModule = await import('jsbarcode');

  const JsBarcode =
    JsBarcodeModule.default || JsBarcodeModule;

  const barcodeSvg =
    document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );

  JsBarcode(
    barcodeSvg,
    value,
    {
      format: 'CODE128',
      width: 1,
      height: 80,
      displayValue: false,
      margin: 6,
      background: 'transparent',
      lineColor: '#000000'
    }
  );

  const viewBox = barcodeSvg.getAttribute('viewBox') || '0 0 762 92';

  const serializer = new XMLSerializer();
  let content = '';
  const childNodes = Array.from(barcodeSvg.childNodes);
  for (const child of childNodes) {
    content += serializer.serializeToString(child);
  }
  if (!content) {
    content = barcodeSvg.innerHTML || '';
  }

  return { viewBox, content };
}

/*
 * Helper to split and render long addresses in SVG.
 */
function renderSvgAddress(address, x, y) {
  const safe = escapeXml(address || 'N/A');
  if (safe.length <= 48) {
    return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#0f172a">${safe}</text>`;
  }

  const words = safe.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of words) {
    if ((line1 + ' ' + word).trim().length <= 46 && !line2) {
      line1 += (line1 ? ' ' : '') + word;
    } else {
      line2 += (line2 ? ' ' : '') + word;
    }
  }

  return `
    <text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">${line1}</text>
    <text x="${x}" y="${y + 20}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">${line2}</text>
  `;
}

/*
 * Build the Front Side SVG markup.
 */
function getFrontCardSvg({ width, height, formData, logoData, photoData, barcodeContent }) {
  const barcodeViewBox = barcodeContent?.viewBox || '0 0 762 92';
  const barcodeInner = barcodeContent?.content || (typeof barcodeContent === 'string' ? barcodeContent : '');

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <defs>
        <linearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#063b7a" />
          <stop offset="100%" stop-color="#0b65b5" />
        </linearGradient>

        <linearGradient id="footerGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e7f1fa" />
          <stop offset="100%" stop-color="#f8fbff" />
        </linearGradient>
      </defs>

      <!-- Card background -->
      <rect
        x="3"
        y="3"
        width="850"
        height="534"
        rx="24"
        fill="#ffffff"
        stroke="#173b63"
        stroke-width="6"
      />

      <!-- Header -->
      <rect
        x="6"
        y="6"
        width="844"
        height="105"
        rx="20"
        fill="#ffffff"
      />

      ${
        logoData
          ? `
            <image
              href="${logoData}"
              x="317"
              y="11"
              width="222"
              height="95"
              preserveAspectRatio="xMidYMid meet"
            />
          `
          : ''
      }

      <!-- Student identity heading -->
      <rect
        x="6"
        y="111"
        width="844"
        height="44"
        fill="#0b65b5"
      />

      <text
        x="428"
        y="141"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="800"
        letter-spacing="5"
        fill="#ffffff"
      >
        STUDENT IDENTITY CARD
      </text>

      <!-- Photo container -->
      <rect
        x="38"
        y="184"
        width="178"
        height="238"
        rx="8"
        fill="#f3f7fb"
        stroke="#9fb3c8"
        stroke-width="2"
      />

      ${
        photoData
          ? `
            <image
              href="${photoData}"
              x="47"
              y="193"
              width="160"
              height="220"
              preserveAspectRatio="xMidYMid slice"
            />
          `
          : ''
      }

      <!-- Student name -->
      <text
        x="252"
        y="214"
        font-family="Arial, sans-serif"
        font-size="29"
        font-weight="800"
        fill="#0f172a"
      >
        ${escapeXml(
          (
            formData.fullName ||
            'STUDENT NAME'
          ).toUpperCase()
        )}
      </text>

      <!-- Department -->
      <text
        x="252"
        y="247"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#0b65b5"
      >
        ${escapeXml(
          formData.department ||
          'COURSE / DEPARTMENT'
        )}
      </text>

      <!-- Roll / ID -->
      <text
        x="252"
        y="288"
        font-family="Arial, sans-serif"
        font-size="15"
        font-weight="700"
        fill="#334155"
      >
        ROLL / ID
      </text>

      <text
        x="405"
        y="288"
        font-family="Arial, sans-serif"
        font-size="17"
        font-weight="600"
        fill="#0f172a"
      >
        ${escapeXml(
          formData.rollNo ||
          'XXXXXXXXXX'
        )}
      </text>

      <line
        x1="252"
        y1="298"
        x2="805"
        y2="298"
        stroke="#dbe4ee"
      />

      <!-- Department row -->
      <text
        x="252"
        y="329"
        font-family="Arial, sans-serif"
        font-size="15"
        font-weight="700"
        fill="#334155"
      >
        DEPARTMENT
      </text>

      <text
        x="405"
        y="329"
        font-family="Arial, sans-serif"
        font-size="17"
        font-weight="600"
        fill="#0f172a"
      >
        ${escapeXml(
          formData.department ||
          'N/A'
        )}
      </text>

      <line
        x1="252"
        y1="339"
        x2="805"
        y2="339"
        stroke="#dbe4ee"
      />

      <!-- Batch -->
      <text
        x="252"
        y="370"
        font-family="Arial, sans-serif"
        font-size="15"
        font-weight="700"
        fill="#334155"
      >
        BATCH
      </text>

      <text
        x="405"
        y="370"
        font-family="Arial, sans-serif"
        font-size="17"
        font-weight="600"
        fill="#0f172a"
      >
        ${escapeXml(
          formData.batch ||
          'YYYY - YYYY'
        )}
      </text>

      <line
        x1="252"
        y1="380"
        x2="805"
        y2="380"
        stroke="#dbe4ee"
      />

      <!-- Blood group -->
      <text
        x="252"
        y="411"
        font-family="Arial, sans-serif"
        font-size="15"
        font-weight="700"
        fill="#334155"
      >
        BLOOD GROUP
      </text>

      <text
        x="405"
        y="411"
        font-family="Arial, sans-serif"
        font-size="17"
        font-weight="600"
        fill="#0f172a"
      >
        ${escapeXml(
          formData.bloodGroup ||
          'N/A'
        )}
      </text>

      <!-- Residence -->
      <rect
        x="616"
        y="349"
        width="181"
        height="49"
        rx="10"
        fill="#eff6ff"
        stroke="#bfdbfe"
      />

      <text
        x="707"
        y="369"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="12"
        font-weight="700"
        fill="#475569"
      >
        RESIDENCE
      </text>

      <text
        x="707"
        y="388"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="15"
        font-weight="800"
        fill="#0b65b5"
      >
        ${escapeXml(
          formData.residenceType ||
          'Not selected'
        )}
      </text>

      <!-- Footer -->
      <rect
        x="6"
        y="445"
        width="844"
        height="89"
        fill="url(#footerGradient)"
      />

      <svg
        x="240"
        y="454"
        width="210"
        height="34"
        viewBox="${barcodeViewBox}"
        preserveAspectRatio="xMidYMid meet"
        shape-rendering="crispEdges"
      >
        ${barcodeInner}
      </svg>

      <text
        x="240"
        y="506"
        font-family="Arial, sans-serif"
        font-size="10"
        font-weight="700"
        letter-spacing="1"
        fill="#64748b"
      >
        SCAN TO VERIFY
      </text>

      <!-- Contact -->
      <text
        x="803"
        y="481"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="12"
        fill="#64748b"
      >
        CONTACT
      </text>

      <text
        x="803"
        y="501"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="17"
        font-weight="700"
        fill="#0f172a"
      >
        ${escapeXml(
          formData.phoneNumber ||
          'N/A'
        )}
      </text>

      <text
        x="803"
        y="521"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="11"
        fill="#64748b"
      >
        Issued by Vignan&apos;s University
      </text>
    </svg>
  `;
}

/*
 * Build the Back Side SVG markup based on the physical Vignan's card reference.
 */
function getBackCardSvg({ width, height, formData, barcodeContent }) {
  const barcodeViewBox = barcodeContent?.viewBox || '0 0 762 92';
  const barcodeInner = barcodeContent?.content || (typeof barcodeContent === 'string' ? barcodeContent : '');

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <defs>
        <linearGradient id="backFooterGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e7f1fa" />
          <stop offset="100%" stop-color="#f8fbff" />
        </linearGradient>
      </defs>

      <!-- Card outline & background -->
      <rect
        x="3"
        y="3"
        width="850"
        height="534"
        rx="24"
        fill="#ffffff"
        stroke="#173b63"
        stroke-width="6"
      />

      <!-- TOP SECTION: Father Name, Address, Phone No -->
      <!-- Father Name -->
      <text x="44" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">Father Name</text>
      <text x="175" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">:</text>
      <text x="195" y="54" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#0f172a">
        ${escapeXml((formData.fatherName || 'N/A').toUpperCase())}
      </text>

      <!-- Address -->
      <text x="44" y="94" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">Address</text>
      <text x="175" y="94" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">:</text>
      ${renderSvgAddress(formData.address || 'N/A', 195, 94)}

      <!-- Phone No -->
      <text x="44" y="160" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">Phone No</text>
      <text x="175" y="160" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#1e293b">:</text>
      <text x="195" y="160" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#0f172a">
        ${escapeXml(formData.phoneNumber || 'N/A')}
      </text>

      <!-- MIDDLE SECTION: Black Horizontal Strip -->
      <rect x="6" y="192" width="844" height="42" fill="#0f172a" />
      <text
        x="428"
        y="219"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="18"
        font-weight="700"
        letter-spacing="3"
        fill="#ffffff"
      >
        www.vignan.ac.in
      </text>

      <!-- INSTITUTION RETURN TO SECTION -->
      <text
        x="428"
        y="266"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="14"
        font-style="italic"
        font-weight="600"
        fill="#475569"
      >
        If Found Please return to
      </text>

      <text
        x="428"
        y="296"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="800"
        fill="#0b65b5"
      >
        Vignan&apos;s Foundation For Science, Technology &amp; Research
      </text>

      <text
        x="428"
        y="320"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="14"
        font-weight="600"
        fill="#334155"
      >
        (Deemed to be University)
      </text>

      <text
        x="428"
        y="342"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="14"
        font-weight="500"
        fill="#475569"
      >
        Vadlamudi, Guntur - 522 213, A.P., India
      </text>

      <text
        x="428"
        y="364"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="500"
        fill="#64748b"
      >
        Ph: 0863 - 2344700 / 701, Fax: 0863 - 2344707
      </text>

      <!-- BOTTOM SECTION: Barcode + Roll No -->
      <rect
        x="6"
        y="390"
        width="844"
        height="144"
        fill="url(#backFooterGradient)"
      />
      <line x1="6" y1="390" x2="850" y2="390" stroke="#e2e8f0" stroke-width="1.5" />

      <svg
        x="298"
        y="408"
        width="260"
        height="44"
        viewBox="${barcodeViewBox}"
        preserveAspectRatio="xMidYMid meet"
        shape-rendering="crispEdges"
      >
        ${barcodeInner}
      </svg>

      <text
        x="428"
        y="496"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="800"
        letter-spacing="3"
        fill="#0f172a"
      >
        ${escapeXml(formData.rollNo || 'XXXXXXXXXX')}
      </text>
    </svg>
  `;
}

/*
 * Render SVG string to HTML Image object.
 */
async function loadSvgImage(svg) {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.decoding = 'async';
  image.src = svgUrl;

  try {
    await image.decode();
    return { image, svgUrl };
  } catch (err) {
    URL.revokeObjectURL(svgUrl);
    throw err;
  }
}

/*
 * Convert Canvas to PNG and trigger browser file download.
 */
async function triggerPngDownload(canvas, filename) {
  const pngBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png', 1);
  });

  if (!pngBlob) {
    throw new Error('Could not create the ID card image.');
  }

  const downloadUrl = URL.createObjectURL(pngBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(downloadUrl);
}

/*
 * Download ID card as PNG (supports 'front', 'back', or 'both').
 */
async function downloadCardAsPng(formData, side = 'front') {
  const width = 856;
  const height = 540;

  if (!formData.id) {
    throw new Error(
      'Unable to generate verification barcode because the ID card has not been saved yet.'
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${encodeURIComponent(formData.id)}`;

  const [logoData, photoData, barcodeContent] = await Promise.all([
    imageToDataUrl('/vignans-logo.png'),
    formData.photo ? imageToDataUrl(formData.photo) : Promise.resolve(''),
    generateBarcodeSvg(verificationUrl)
  ]);

  const safeName = (formData.fullName || 'student')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '');

  if (side === 'back') {
    const backSvg = getBackCardSvg({ width, height, formData, barcodeContent });
    const { image, svgUrl } = await loadSvgImage(backSvg);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to create canvas context.');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      await triggerPngDownload(canvas, `${safeName || 'student'}_ID_Card_Back.png`);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
    return;
  }

  if (side === 'both') {
    const frontSvg = getFrontCardSvg({ width, height, formData, logoData, photoData, barcodeContent });
    const backSvg = getBackCardSvg({ width, height, formData, barcodeContent });

    const [frontLoaded, backLoaded] = await Promise.all([
      loadSvgImage(frontSvg),
      loadSvgImage(backSvg)
    ]);

    try {
      const gap = 36;
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = (height * 2 + gap) * 2;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to create canvas context.');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Front Card
      context.drawImage(frontLoaded.image, 0, 0, canvas.width, height * 2);

      // Draw Back Card
      context.drawImage(backLoaded.image, 0, (height + gap) * 2, canvas.width, height * 2);

      await triggerPngDownload(canvas, `${safeName || 'student'}_ID_Card_Both.png`);
    } finally {
      URL.revokeObjectURL(frontLoaded.svgUrl);
      URL.revokeObjectURL(backLoaded.svgUrl);
    }
    return;
  }

  // Default: Front only
  const frontSvg = getFrontCardSvg({ width, height, formData, logoData, photoData, barcodeContent });
  const { image, svgUrl } = await loadSvgImage(frontSvg);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create canvas context.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    await triggerPngDownload(canvas, `${safeName || 'student'}_ID_Card.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function CardPreview({
  formData,
  onPrepareDownload
}) {
  const defaultAvatar =
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  const [previewSide, setPreviewSide] = useState('front');
  const [isDownloading, setIsDownloading] = useState(false);

  const cardId = formData.id || '';
  const verificationUrl = cardId
    ? `${window.location.origin}/verify/${encodeURIComponent(cardId)}`
    : '';

  const handleDownloadCard = async () => {
    if (!formData.fullName || !formData.rollNo) {
      alert(
        'Please enter the student name and roll number before downloading the ID card.'
      );
      return;
    }

    setIsDownloading(true);

    try {
      let savedCard = formData;

      if (onPrepareDownload) {
        savedCard = await onPrepareDownload();
      }

      if (!savedCard || !savedCard.id) {
        throw new Error(
          'Unable to create a verification ID for this card.'
        );
      }

      await downloadCardAsPng(savedCard, previewSide);
    } catch (error) {
      console.error('ID card download error:', error);
      alert(error.message || 'Unable to download the ID card.');
    } finally {
      setIsDownloading(false);
    }
  };

  /*
   * FRONT ID CARD
   */
  const renderFrontCard = () => (
    <div className="id-card">
      {/* Header */}
      <div className="card-header">
        <div className="logo-container">
          <img
            src="/vignans-logo.png"
            alt="Vignan's logo"
            className="college-logo"
          />
        </div>
      </div>

      <div className="card-badge">
        STUDENT IDENTITY CARD
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="photo-section">
          <img
            src={formData.photo || defaultAvatar}
            alt="Profile Preview"
            className="profile-photo"
          />
        </div>

        <div className="info-section">
          <p className="student-name">
            {formData.fullName
              ? formData.fullName.toUpperCase()
              : 'STUDENT NAME'}
          </p>

          <p className="student-dept">
            {formData.department || 'COURSE / DEPARTMENT'}
          </p>

          <div className="details-and-residence">
            <table className="info-table">
              <tbody>
                <tr>
                  <td><strong>ROLL / ID</strong></td>
                  <td>{formData.rollNo || 'XXXXXXXXXX'}</td>
                </tr>

                <tr>
                  <td><strong>DEPARTMENT</strong></td>
                  <td>{formData.department || 'N/A'}</td>
                </tr>

                <tr>
                  <td><strong>BATCH</strong></td>
                  <td>{formData.batch || 'YYYY - YYYY'}</td>
                </tr>

                <tr>
                  <td><strong>BLOOD GROUP</strong></td>
                  <td>{formData.bloodGroup || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            <div className="residence-badge-box">
              <span className="residence-badge-label">RESIDENCE</span>
              <span className="residence-badge-val">
                {formData.residenceType || 'Not selected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="barcode-container">
          {verificationUrl ? (
            <>
              <Barcode
                value={verificationUrl}
                format="CODE128"
                width={1}
                height={75}
                displayValue={false}
                margin={4}
                background="transparent"
                lineColor="#000000"
              />
              <p className="barcode-text">SCAN TO VERIFY</p>
            </>
          ) : (
            <>
              <div
                className="barcode-placeholder"
                style={{
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  color: '#64748b'
                }}
              >
                Save card to generate barcode
              </div>
              <p className="barcode-text">VERIFICATION BARCODE</p>
            </>
          )}
        </div>

        <div className="card-footer-contact">
          <span className="footer-contact-label">CONTACT</span>
          <span className="footer-contact-phone">
            {formData.phoneNumber || 'N/A'}
          </span>
          <span className="footer-contact-sub">
            Issued by Vignan&apos;s University
          </span>
        </div>
      </div>
    </div>
  );

  /*
   * BACK ID CARD (Layout based on physical Vignan's card reference)
   */
  const renderBackCard = () => (
    <div className="id-card id-card-back">
      {/* TOP SECTION: Father Name, Address, Phone No */}
      <div className="back-top-section">
        <div className="back-field-row">
          <span className="back-field-label">Father Name</span>
          <span className="back-field-colon">:</span>
          <span className="back-field-value">
            {formData.fatherName ? formData.fatherName.toUpperCase() : 'N/A'}
          </span>
        </div>

        <div className="back-field-row">
          <span className="back-field-label">Address</span>
          <span className="back-field-colon">:</span>
          <span className="back-field-value">
            {formData.address || 'N/A'}
          </span>
        </div>

        <div className="back-field-row">
          <span className="back-field-label">Phone No</span>
          <span className="back-field-colon">:</span>
          <span className="back-field-value">
            {formData.phoneNumber || 'N/A'}
          </span>
        </div>
      </div>

      {/* MIDDLE SECTION: Black Horizontal Strip */}
      <div className="back-black-strip">
        <span>www.vignan.ac.in</span>
      </div>

      {/* INSTITUTION RETURN TO SECTION */}
      <div className="back-institution-section">
        <p className="back-return-text">If Found Please return to</p>
        <p className="back-inst-title">
          Vignan&apos;s Foundation For Science, Technology &amp; Research
        </p>
        <p className="back-inst-deemed">(Deemed to be University)</p>
        <p className="back-inst-address">Vadlamudi, Guntur - 522 213, A.P., India</p>
        <p className="back-inst-contact">Ph: 0863 - 2344700 / 701, Fax: 0863 - 2344707</p>
      </div>

      {/* BOTTOM SECTION: Barcode + Roll No below */}
      <div className="back-footer">
        <div className="back-barcode-box">
          {verificationUrl ? (
            <Barcode
              value={verificationUrl}
              format="CODE128"
              width={1}
              height={85}
              displayValue={false}
              margin={6}
              background="transparent"
              lineColor="#000000"
            />
          ) : (
            <div
              className="barcode-placeholder"
              style={{
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#64748b'
              }}
            >
              Save card to generate barcode
            </div>
          )}
          <p className="back-roll-text">
            {formData.rollNo || 'XXXXXXXXXX'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="preview-container">
      <h2>ID Card Preview</h2>

      {/* Front / Back / Both Toggle Control */}
      <div className="card-side-toggle" role="group" aria-label="Card side preview selector">
        <button
          type="button"
          className={`toggle-side-btn ${previewSide === 'front' ? 'active' : ''}`}
          onClick={() => setPreviewSide('front')}
        >
          Front
        </button>
        <button
          type="button"
          className={`toggle-side-btn ${previewSide === 'back' ? 'active' : ''}`}
          onClick={() => setPreviewSide('back')}
        >
          Back
        </button>
        <button
          type="button"
          className={`toggle-side-btn ${previewSide === 'both' ? 'active' : ''}`}
          onClick={() => setPreviewSide('both')}
        >
          Both
        </button>
      </div>

      <div
        className="id-card-canvas"
        id="printable-card-area"
      >
        {previewSide === 'front' && renderFrontCard()}
        {previewSide === 'back' && renderBackCard()}
        {previewSide === 'both' && (
          <div className="both-cards-wrapper">
            <div className="both-card-item">
              <span className="card-side-badge">Front Side</span>
              {renderFrontCard()}
            </div>
            <div className="both-card-item">
              <span className="card-side-badge">Back Side</span>
              {renderBackCard()}
            </div>
          </div>
        )}
      </div>

      <button
        className="btn-print"
        onClick={handleDownloadCard}
        disabled={isDownloading}
      >
        {isDownloading
          ? 'Preparing ID Card...'
          : previewSide === 'back'
          ? '⬇️ Download Back Side'
          : previewSide === 'both'
          ? '⬇️ Download Both Sides'
          : '⬇️ Download ID Card'}
      </button>
    </div>
  );
}

export { downloadCardAsPng };
export default CardPreview;