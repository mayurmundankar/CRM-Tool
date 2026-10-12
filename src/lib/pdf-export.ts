export interface SpecPdfData {
  roomType: string
  styleStyle: string
  areaSqFt: string
  clientPrompt: string
  content: string
  modelName: string
}

export function exportSpecToPdf(data: SpecPdfData) {
  if (typeof window === 'undefined') return

  // Format markdown-like text to clean styled HTML
  const formattedHtml = data.content
    .split('\n\n')
    .map((paragraph) => {
      const trimmed = paragraph.trim()
      if (!trimmed) return ''

      // Headers (### or ## or #)
      if (trimmed.startsWith('#')) {
        const headerText = trimmed.replace(/^#+\s*/, '')
        return `<h3 class="section-title">${escapeHtml(headerText)}</h3>`
      }

      // Numbered or bold section header (e.g., **1. Architectural Lighting...**)
      if (trimmed.startsWith('**') && trimmed.includes(':**')) {
        return `<h3 class="section-title">${parseMarkdownInline(trimmed)}</h3>`
      }

      // Bullet lists
      if (trimmed.includes('\n•') || trimmed.includes('\n-') || trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const items = trimmed
          .split('\n')
          .filter((line) => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./))
          .map((line) => {
            const cleanLine = line.replace(/^[•\-\d+\.]\s*/, '')
            return `<li class="spec-list-item">${parseMarkdownInline(cleanLine)}</li>`
          })
          .join('')
        return `<ul class="spec-list">${items}</ul>`
      }

      return `<p class="spec-paragraph">${parseMarkdownInline(trimmed)}</p>`
    })
    .join('')

  const printWindow = window.open('', '_blank', 'width=900,height=1000')
  if (!printWindow) {
    alert('Please allow popups to generate and download the PDF specification sheet.')
    return
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Atelier BIM - ${escapeHtml(data.roomType)} Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
      padding: 24px;
    }

    /* Print Screen Toolbar */
    .no-print-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13px;
    }

    .btn-print {
      background: #d97706;
      color: #000000;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }

    .btn-print:hover {
      background: #b45309;
      color: #ffffff;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }

    /* Studio Header */
    .studio-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 2px solid #b45309;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: 1px;
      color: #0f172a;
    }

    .brand-subtitle {
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #b45309;
      font-weight: 600;
      margin-top: 2px;
    }

    .doc-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
    }

    .doc-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      margin-bottom: 4px;
    }

    /* Project Summary Table */
    .project-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
      font-size: 9pt;
    }

    .grid-cell-label {
      text-transform: uppercase;
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .grid-cell-value {
      font-weight: 600;
      color: #0f172a;
    }

    /* Client Brief Box */
    .client-brief {
      background: #fffbeb;
      border-left: 3px solid #d97706;
      padding: 10px 14px;
      margin-bottom: 22px;
      font-size: 9pt;
      color: #78350f;
    }

    .client-brief-title {
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    /* Content Typography */
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 12pt;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 18px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    .spec-paragraph {
      margin-bottom: 10px;
      font-size: 9.5pt;
      color: #334155;
    }

    .spec-list {
      margin-left: 20px;
      margin-bottom: 14px;
    }

    .spec-list-item {
      margin-bottom: 6px;
      font-size: 9.5pt;
      color: #1e293b;
    }

    strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* Sign-off Section */
    .signoff-section {
      margin-top: 36px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      font-size: 8.5pt;
      color: #475569;
      page-break-inside: avoid;
    }

    .signoff-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      background: #fafafa;
    }

    .signoff-line {
      border-bottom: 1px solid #94a3b8;
      height: 28px;
      margin-top: 12px;
      margin-bottom: 4px;
    }

    .footer-stamp {
      margin-top: 24px;
      text-align: center;
      font-size: 7.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>Print Preview</strong> • Ready to save as vector PDF
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">Save as PDF / Print</button>
      <button class="btn-print" style="background: #334155; color: #fff;" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="studio-header">
    <div>
      <h1 class="brand-title">ATELIER BIM STUDIO</h1>
      <div class="brand-subtitle">Interior Architecture & Revit Automation Specification Sheet</div>
    </div>
    <div class="doc-meta">
      <div class="doc-badge">Revit LOD 350 / 400</div>
      <div>Sheet Ref: <strong>E-101 / P-201 / ID-304</strong></div>
      <div>Date: <strong>${escapeHtml(currentDate)}</strong></div>
      <div>Engine: <strong>${escapeHtml(data.modelName)}</strong></div>
    </div>
  </div>

  <div class="project-grid">
    <div>
      <div class="grid-cell-label">Space / Room Zone</div>
      <div class="grid-cell-value">${escapeHtml(data.roomType)}</div>
    </div>
    <div>
      <div class="grid-cell-label">Design Aesthetic</div>
      <div class="grid-cell-value">${escapeHtml(data.styleStyle)}</div>
    </div>
    <div>
      <div class="grid-cell-label">Total Floor Area</div>
      <div class="grid-cell-value">${escapeHtml(data.areaSqFt)} sq ft</div>
    </div>
    <div>
      <div class="grid-cell-label">Target Compliance</div>
      <div class="grid-cell-value">IESNA / UPC / ADA / Revit API</div>
    </div>
  </div>

  ${
    data.clientPrompt
      ? `<div class="client-brief">
          <div class="client-brief-title">Design Intent & Client Requirements</div>
          <div>&quot;${escapeHtml(data.clientPrompt)}&quot;</div>
        </div>`
      : ''
  }

  <div class="spec-body">
    ${formattedHtml}
  </div>

  <div class="signoff-section">
    <div class="signoff-box">
      <div class="grid-cell-label">AI BIM Automation Engineer</div>
      <div>Generated via Atelier BIM Studio</div>
      <div class="signoff-line"></div>
      <div>Signature & Timestamp</div>
    </div>
    <div class="signoff-box">
      <div class="grid-cell-label">Lead Architect Review</div>
      <div>Verified for Technical LOD 350</div>
      <div class="signoff-line"></div>
      <div>Architect of Record</div>
    </div>
    <div class="signoff-box">
      <div class="grid-cell-label">Client Approval Sign-Off</div>
      <div>Authorized for Procurement</div>
      <div class="signoff-line"></div>
      <div>Client Signature</div>
    </div>
  </div>

  <div class="footer-stamp">
    Atelier BIM Studio • Official Architectural Deliverable • Confidential & Proprietary
  </div>

  <script>
    // Auto-trigger print after font load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(htmlDocument)
  printWindow.document.close()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function parseMarkdownInline(text: string): string {
  // Bold **text**
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic *text*
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>')
  return parsed
}
