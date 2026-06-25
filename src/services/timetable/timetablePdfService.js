import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_PERIODS = 8;

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cellStyle(timetableType, subject) {
  if (timetableType === 'LUNCH') return 'background:#fef9c3;color:#92400e;';
  if (timetableType === 'BREAK') return 'background:#dcfce7;color:#166534;';
  if (!subject) return 'background:#f8fafc;color:#94a3b8;';
  return 'background:#eff6ff;color:#1e40af;';
}

function buildSectionHTML(periods, className, sectionName) {
  const byKey = {};
  for (const p of periods || []) {
    byKey[`${p.day}_${p.periodNum}`] = p;
  }
  const dayHeaders = DAYS.map(
    d => `<th style="background:#1e40af;color:#fff;padding:5px;font-size:10px;">${d.slice(0, 3)}</th>`,
  ).join('');
  const rows = Array.from({length: MAX_PERIODS}, (_, i) => {
    const pNum = i + 1;
    const cells = DAYS.map(day => {
      const p = byKey[`${day}_${pNum}`];
      if (!p || !p.subject) {
        return '<td style="background:#f8fafc;color:#94a3b8;text-align:center;font-size:9px;padding:3px;">—</td>';
      }
      const cs = cellStyle(p.timetableType, p.subject);
      const time = p.startTime
        ? `<br/><span style="font-size:8px;">${esc(p.startTime)}${p.endTime ? '–' + esc(p.endTime) : ''}</span>`
        : '';
      const teacher = p.teacherName
        ? `<br/><span style="font-size:8px;color:#64748b;">${esc(p.teacherName)}</span>`
        : '';
      return `<td style="${cs}text-align:center;font-size:9px;padding:3px;">${esc(p.subject)}${time}${teacher}</td>`;
    }).join('');
    return `<tr><td style="background:#f1f5f9;text-align:center;font-weight:700;font-size:9px;padding:4px;width:20px;">P${pNum}</td>${cells}</tr>`;
  }).join('');

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:12px;font-size:12px;">
<h2 style="margin:0 0 2px;color:#1e293b;">${esc(className)} — Section ${esc(sectionName)}</h2>
<p style="color:#64748b;margin:0 0 8px;font-size:10px;">Class Timetable</p>
<table width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;">
<thead><tr><th style="background:#1e40af;color:#fff;padding:5px;font-size:10px;width:20px;">P#</th>${dayHeaders}</tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="font-size:8px;color:#94a3b8;margin-top:8px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
</body></html>`;
}

function buildTeacherHTML(timetables, teacherName, teacherId) {
  const allPeriods = [];
  for (const tt of timetables || []) {
    for (const p of tt.periods || []) {
      if (p.teacherId === teacherId && p.subject) {
        allPeriods.push({...p, sectionLabel: `${tt.className} ${tt.sectionName}`});
      }
    }
  }
  const activeDays = DAYS.filter(d => allPeriods.some(p => p.day === d));
  const rows = activeDays.map(day => {
    const dayPeriods = allPeriods
      .filter(p => p.day === day)
      .sort((a, b) => a.periodNum - b.periodNum);
    const pRows = dayPeriods.map(
      p => `<tr>
<td style="text-align:center;">${p.periodNum}</td>
<td style="font-weight:600;">${esc(p.subject)}</td>
<td>${esc(p.sectionLabel)}</td>
<td>${esc(p.startTime || '')}${p.endTime ? '–' + esc(p.endTime) : ''}</td>
<td>${esc(p.room || '')}</td>
</tr>`,
    ).join('');
    return `<tr><td colspan="5" style="background:#1e40af;color:#fff;font-weight:700;padding:5px;font-size:10px;">${day}</td></tr>${pRows}`;
  }).join('');

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:12px;font-size:12px;">
<h2 style="margin:0 0 2px;color:#1e293b;">${esc(teacherName)}</h2>
<p style="color:#64748b;margin:0 0 8px;font-size:10px;">My Weekly Schedule</p>
<table width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;">
<thead style="background:#f1f5f9;"><tr><th>P#</th><th>Subject</th><th>Class</th><th>Time</th><th>Room</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="font-size:8px;color:#94a3b8;margin-top:8px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
</body></html>`;
}

function buildParentHTML(periods, childName, className, sectionName) {
  const activeDays = DAYS.filter(d => periods.some(p => p.day === d));
  const rows = activeDays.map(day => {
    const dayPeriods = periods
      .filter(p => p.day === day)
      .sort((a, b) => a.periodNum - b.periodNum);
    const pRows = dayPeriods.map(p => {
      const isBreak = p.timetableType === 'LUNCH' || p.timetableType === 'BREAK';
      const rowBg = isBreak ? 'background:#fef9c3;' : '';
      return `<tr style="${rowBg}">
<td style="text-align:center;">${p.periodNum}</td>
<td style="font-weight:600;">${esc(p.subject)}</td>
<td>${esc(p.teacherName || (isBreak ? '—' : ''))}</td>
<td>${esc(p.startTime || '')}${p.endTime ? '–' + esc(p.endTime) : ''}</td>
</tr>`;
    }).join('');
    return `<tr><td colspan="4" style="background:#1e40af;color:#fff;font-weight:700;padding:5px;font-size:10px;">${day}</td></tr>${pRows}`;
  }).join('');

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:12px;font-size:12px;">
<h2 style="margin:0 0 2px;color:#1e293b;">${esc(childName)}</h2>
<p style="color:#64748b;margin:0 0 8px;font-size:10px;">${esc(className)} ${esc(sectionName)} — Class Timetable</p>
<table width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;">
<thead style="background:#f1f5f9;"><tr><th>P#</th><th>Subject</th><th>Teacher</th><th>Time</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="font-size:8px;color:#94a3b8;margin-top:8px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
</body></html>`;
}

async function generateAndShare(html, fileName) {
  const result = await RNHTMLtoPDF.convert({html, fileName, base64: false});
  await Share.open({
    url: `file://${result.filePath}`,
    type: 'application/pdf',
    title: fileName,
    failOnCancel: false,
  });
}

const timetablePdfService = {
  async downloadSectionPDF(periods, className, sectionName) {
    const html = buildSectionHTML(periods, className, sectionName);
    await generateAndShare(html, `Timetable_${className}_Sec${sectionName}`);
  },
  async downloadTeacherPDF(timetables, teacherName, teacherId) {
    const html = buildTeacherHTML(timetables, teacherName, teacherId);
    await generateAndShare(html, `Timetable_${teacherName}`.replace(/\s+/g, '_'));
  },
  async downloadParentPDF(periods, childName, className, sectionName) {
    const html = buildParentHTML(periods, childName, className, sectionName);
    await generateAndShare(html, `Timetable_${childName}`.replace(/\s+/g, '_'));
  },
};

export default timetablePdfService;
