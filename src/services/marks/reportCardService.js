/**
 * Report Card PDF generation — mirrors the pattern in src/utils/pdf/receiptGenerator.js.
 * Uses react-native-html-to-pdf for PDF creation and react-native-share for sharing.
 */
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {computeGrade} from './marksService';

let createPdfFromHtml;

function getPdfGenerator() {
  if (createPdfFromHtml) return createPdfFromHtml;
  try {
    const htmlToPdf = require('react-native-html-to-pdf');
    createPdfFromHtml =
      htmlToPdf.generatePDF ||
      htmlToPdf.default?.generatePDF ||
      htmlToPdf.default?.convert ||
      htmlToPdf.convert;
    return createPdfFromHtml;
  } catch {
    throw new Error('PDF generation is not available in this build. Reinstall the app.');
  }
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

export function generateReportCardHTML({student, exam, subjectRows, totalObtained, totalMax, percentage, grade, gradeLabel, branchName, academicYearName}) {
  const examDate = exam?.startDate ? formatDateForDisplay(exam.startDate) : '—';
  const hasSubjectDates = (subjectRows || []).some(r => r.examDate);
  const className = student?.section?.academicClass?.name || '';
  const sectionName = student?.section?.name || '';
  const {grade: pGrade} = computeGrade(percentage);
  const passColor = percentage >= 40 ? '#10B981' : '#EF4444';

  const subjectRowsHTML = subjectRows
    .map(row => {
      const statusColor = row.isAbsent ? '#F59E0B' : row.passed ? '#10B981' : '#EF4444';
      const statusLabel = row.isAbsent ? 'AB' : row.passed ? 'P' : 'F';
      const obtained = row.isAbsent ? 'AB' : row.marksObtained != null ? row.marksObtained : '—';
      const dateTd = hasSubjectDates
        ? `<td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;">${row.examDate ? formatDateForDisplay(row.examDate) : '—'}</td>`
        : '';
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-weight:600;">${row.subjectName}</td>
          ${dateTd}
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${obtained}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${row.maxMarks}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${row.passingMarks}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">
            <span style="background:${statusColor}20;color:${statusColor};padding:2px 8px;border-radius:4px;font-weight:700;font-size:11px;">${statusLabel}</span>
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0F172A; background: #fff; padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; }
    .school-name { font-size: 22px; font-weight: 800; color: #0EA5E9; letter-spacing: 0.5px; }
    .report-title { font-size: 14px; color: #475569; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .divider { height: 2px; background: linear-gradient(90deg, #0EA5E9, #2563EB); border-radius: 2px; margin: 16px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 9px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; }
    .info-value { font-size: 13px; font-weight: 600; color: #0F172A; margin-top: 2px; }
    .section-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background: #F0F8FF; }
    th { padding: 10px 12px; font-size: 10px; font-weight: 700; color: #475569; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
    th:not(:first-child) { text-align: center; }
    .summary-card { background: #F0F8FF; border-radius: 12px; padding: 16px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 20px; font-weight: 900; }
    .summary-label { font-size: 9px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .footer { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .sig-line { border-top: 1.5px solid #CBD5E1; padding-top: 8px; text-align: center; font-size: 11px; color: #475569; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${branchName || 'NSRIT School'}</div>
    <div class="report-title">Report Card — ${academicYearName || ''}</div>
  </div>
  <div class="divider"></div>

  <div class="info-grid">
    <div class="info-item"><span class="info-label">Student Name</span><span class="info-value">${student?.fullName || '—'}</span></div>
    <div class="info-item"><span class="info-label">Admission No</span><span class="info-value">${student?.studentId || '—'}</span></div>
    <div class="info-item"><span class="info-label">Class & Section</span><span class="info-value">${className} — ${sectionName}</span></div>
    <div class="info-item"><span class="info-label">Roll Number</span><span class="info-value">${student?.rollNumber || '—'}</span></div>
    <div class="info-item"><span class="info-label">Exam Name</span><span class="info-value">${exam?.name || '—'}</span></div>
    <div class="info-item"><span class="info-label">Exam Date</span><span class="info-value">${examDate}</span></div>
  </div>

  <div class="section-title">Marks Details</div>
  <table>
    <thead>
      <tr>
        <th>Subject</th>
        ${hasSubjectDates ? '<th>Date</th>' : ''}
        <th>Marks</th>
        <th>Max</th>
        <th>Pass</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${subjectRowsHTML}</tbody>
  </table>

  <div class="summary-card">
    <div class="summary-item">
      <div class="summary-value" style="color:#0EA5E9;">${totalObtained}</div>
      <div class="summary-label">Total Marks</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color:#2563EB;">${totalMax}</div>
      <div class="summary-label">Max Marks</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color:${passColor};">${percentage}%</div>
      <div class="summary-label">Percentage</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color:${passColor};">${pGrade}</div>
      <div class="summary-label">Grade</div>
    </div>
  </div>

  <div class="footer">
    <div class="sig-line">Class Teacher Signature</div>
    <div class="sig-line">Principal Signature</div>
  </div>
</body>
</html>`;
}

// ─── PDF generation & sharing ─────────────────────────────────────────────────

const reportCardService = {
  async generateReportCardPDF(reportData) {
    const generate = getPdfGenerator();
    const html = generateReportCardHTML(reportData);
    const studentName = reportData.student?.fullName?.replace(/\s+/g, '_') || 'student';
    const examName = reportData.exam?.name?.replace(/\s+/g, '_') || 'exam';
    const fileName = `ReportCard_${studentName}_${examName}`;

    const result = await generate({
      html,
      fileName,
      directory: 'Documents',
      base64: false,
    });

    if (!result?.filePath) throw new Error('PDF generation failed.');
    return result.filePath;
  },

  async shareReportCard(filePath, studentName, examName) {
    const title = `Report Card — ${studentName} — ${examName}`;
    await Share.open({
      title,
      url: `file://${filePath}`,
      type: 'application/pdf',
      subject: title,
      failOnCancel: false,
    });
  },

  async generateAndShare(reportData) {
    const filePath = await this.generateReportCardPDF(reportData);
    await this.shareReportCard(
      filePath,
      reportData.student?.fullName || 'Student',
      reportData.exam?.name || 'Exam',
    );
    return filePath;
  },

  // Clean up cached report card PDFs older than 24h.
  async cleanupOldReportCards() {
    try {
      const dir = RNFS.DocumentDirectoryPath;
      const files = await RNFS.readDir(dir);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const f of files) {
        if (f.name.startsWith('ReportCard_') && new Date(f.mtime).getTime() < cutoff) {
          await RNFS.unlink(f.path).catch(() => {});
        }
      }
    } catch {
      // Cleanup is best-effort.
    }
  },
};

export default reportCardService;
