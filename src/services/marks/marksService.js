import RNFS from 'react-native-fs';
import {GRADE_THRESHOLDS} from '../../config/constants';
import {parseCsv} from '../../utils/csvParser';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {canEnterMarks, canPublishResults, canUnpublishResults} from './examService';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const CSV_MIME = 'text/csv';

// ─── Grade computation ────────────────────────────────────────────────────────

export function computeGrade(percentage) {
  if (percentage == null || isNaN(percentage)) return {grade: '-', label: '-'};
  for (const t of GRADE_THRESHOLDS) {
    if (percentage >= t.min) return {grade: t.grade, label: t.label};
  }
  return {grade: 'F', label: 'Fail'};
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export function computeAnalytics(students, marks, subjectConfigs) {
  const totalStudents = students.length;
  if (!totalStudents) return buildEmptyAnalytics(subjectConfigs);

  // Build a map: studentId → { subjectName → mark }
  const marksByStudent = {};
  for (const m of marks) {
    if (!marksByStudent[m.studentId]) marksByStudent[m.studentId] = {};
    marksByStudent[m.studentId][m.subjectName] = m;
  }

  // Per-subject stats
  const subjectStats = subjectConfigs.map(cfg => {
    const subjectMarks = marks.filter(
      m => m.subjectName === cfg.subjectName && !m.isAbsent && m.marksObtained != null,
    );
    const values = subjectMarks.map(m => m.marksObtained);
    const passed = subjectMarks.filter(m => m.marksObtained >= cfg.passingMarks).length;
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    return {
      subjectName: cfg.subjectName,
      maxMarks: cfg.maxMarks,
      passingMarks: cfg.passingMarks,
      appeared: values.length,
      passed,
      failed: values.length - passed,
      passPercentage: values.length ? Math.round((passed / values.length) * 100) : 0,
      average: Math.round(avg * 10) / 10,
      highest: values.length ? Math.max(...values) : 0,
      lowest: values.length ? Math.min(...values) : 0,
    };
  });

  // Per-student totals for ranking
  const totalMaxMarks = subjectConfigs.reduce((s, c) => s + c.maxMarks, 0);
  const studentTotals = students
    .map(student => {
      const sm = marksByStudent[student.id] || {};
      const subjectEntries = subjectConfigs.map(cfg => sm[cfg.subjectName]);
      const appeared = subjectEntries.some(m => m && !m.isAbsent && m.marksObtained != null);
      if (!appeared) return {studentId: student.id, total: null, percentage: null};
      const total = subjectEntries.reduce((s, m) => {
        if (!m || m.isAbsent || m.marksObtained == null) return s;
        return s + m.marksObtained;
      }, 0);
      return {
        studentId: student.id,
        fullName: student.fullName,
        total,
        percentage: totalMaxMarks ? Math.round((total / totalMaxMarks) * 10000) / 100 : 0,
      };
    })
    .filter(s => s.total != null)
    .sort((a, b) => b.total - a.total);

  // Assign ranks (ties share the same rank)
  let rank = 1;
  for (let i = 0; i < studentTotals.length; i++) {
    if (i > 0 && studentTotals[i].total < studentTotals[i - 1].total) rank = i + 1;
    studentTotals[i].rank = rank;
  }

  const appeared = studentTotals.length;
  const passed = studentTotals.filter(s => {
    // A student passes if they pass every subject
    const sm = marksByStudent[s.studentId] || {};
    return subjectConfigs.every(cfg => {
      const m = sm[cfg.subjectName];
      if (!m || m.isAbsent) return false;
      return m.marksObtained >= cfg.passingMarks;
    });
  }).length;

  return {
    totalStudents,
    appeared,
    passed,
    failed: appeared - passed,
    passPercentage: appeared ? Math.round((passed / appeared) * 100) : 0,
    totalMaxMarks,
    subjectStats,
    rankings: studentTotals.slice(0, 10),
  };
}

function buildEmptyAnalytics(subjectConfigs) {
  return {
    totalStudents: 0,
    appeared: 0,
    passed: 0,
    failed: 0,
    passPercentage: 0,
    totalMaxMarks: 0,
    subjectStats: subjectConfigs.map(c => ({
      subjectName: c.subjectName,
      maxMarks: c.maxMarks,
      passingMarks: c.passingMarks,
      appeared: 0,
      passed: 0,
      failed: 0,
      passPercentage: 0,
      average: 0,
      highest: 0,
      lowest: 0,
    })),
    rankings: [],
  };
}

// ─── Core marks service ───────────────────────────────────────────────────────

const marksService = {
  async getMarksForSection(examId, sectionId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_MARKS_FOR_SECTION, {
      examId,
      sectionId,
    });
    return {
      students: data.students || [],
      subjectConfigs: data.examSubjectConfigs || [],
      examSection: (data.examSections || [])[0] || null,
    };
  },

  async saveStudentMark(
    {examId, studentId, sectionId, branchId, academicYearId, subjectName, marksObtained, isAbsent, enteredById},
    maxMarks,
    role,
  ) {
    if (!canEnterMarks(role)) throw new Error('You do not have permission to enter marks.');

    const mo = marksObtained == null ? null : Number(marksObtained);
    if (!isAbsent && mo !== null) {
      if (mo < 0) throw new Error(`Marks cannot be negative.`);
      if (maxMarks != null && mo > maxMarks) {
        throw new Error(`Marks (${mo}) cannot exceed maximum marks (${maxMarks}).`);
      }
    }

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPSERT_STUDENT_MARK, {
      examId,
      studentId,
      sectionId,
      branchId,
      academicYearId,
      subjectName,
      marksObtained: isAbsent ? null : mo,
      isAbsent: Boolean(isAbsent),
      enteredById,
    });
  },

  // Sequential bulk save — stops on first validation failure and returns a report.
  async bulkSaveMarks(marksArray, options = {}) {
    const {branchId, academicYearId, examId, sectionId, enteredById, role, subjectConfigs = []} = options;
    const configBySubject = Object.fromEntries(subjectConfigs.map(c => [c.subjectName, c]));

    const results = {total: marksArray.length, saved: 0, failed: 0, errors: []};
    for (let i = 0; i < marksArray.length; i++) {
      const row = marksArray[i];
      try {
        const cfg = configBySubject[row.subjectName];
        await this.saveStudentMark(
          {
            examId,
            studentId: row.studentId,
            sectionId,
            branchId,
            academicYearId,
            subjectName: row.subjectName,
            marksObtained: row.marksObtained,
            isAbsent: row.isAbsent || false,
            enteredById,
          },
          cfg?.maxMarks,
          role,
        );
        results.saved++;
      } catch (err) {
        results.failed++;
        results.errors.push({rowIndex: i, studentName: row.studentName || '', error: err.message});
      }
    }
    return results;
  },

  async publishResults(examSectionId, publishedById, examId, sectionId, examName, branchId, academicYearId, role) {
    if (!canPublishResults(role)) throw new Error('You do not have permission to publish results.');

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.PUBLISH_EXAM_SECTION, {
      examSectionId,
      publishedById,
    });

    // Send notifications to parents of all students in this section.
    try {
      const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS_BY_SECTION, {
        sectionId,
        limit: 200,
        offset: 0,
      });
      const students = data.students || [];
      for (const student of students) {
        const parentUserId = student.parent?.userId;
        if (!parentUserId) continue;
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_NOTIFICATION, {
          userId: parentUserId,
          branchId,
          title: 'Exam Results Published',
          message: `Results for ${student.fullName} in ${examName} are now available. Open the app to view marks and download the report card.`,
          category: 'EXAM_RESULT',
          createdById: publishedById,
          createdByRole: role,
        });
      }
    } catch {
      // Notification failures must not block the publish action.
    }
  },

  async unpublishResults(examSectionId, role) {
    if (!canUnpublishResults(role)) throw new Error('Only principals can unpublish results.');
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UNPUBLISH_EXAM_SECTION, {examSectionId});
  },

  async getStudentResults(studentId, academicYearId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_RESULTS_FOR_PARENT, {
      studentId,
      academicYearId,
    });
    return (data.examSections || []).map(es => ({
      examSectionId: es.id,
      isPublished: es.isPublished,
      publishedAt: es.publishedAt,
      exam: es.exam,
      section: es.section,
    }));
  },

  async getStudentResultDetail(examId, studentId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_RESULT_DETAIL, {
      examId,
      studentId,
    });
    const marks = data.studentMarks || [];
    const subjectConfigs = data.examSubjectConfigs || [];
    const exam = (data.exams || [])[0];
    const student = marks[0]?.student || null;

    // Compute total + percentage + grade
    const totalMax = subjectConfigs.reduce((s, c) => s + c.maxMarks, 0);
    const totalObtained = marks
      .filter(m => !m.isAbsent && m.marksObtained != null)
      .reduce((s, m) => s + m.marksObtained, 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
    const {grade, label: gradeLabel} = computeGrade(percentage);

    // Merge mark data with subject config
    const subjectRows = subjectConfigs.map(cfg => {
      const mark = marks.find(m => m.subjectName === cfg.subjectName);
      const obtained = mark?.marksObtained ?? null;
      const absent = mark?.isAbsent ?? false;
      const passed = !absent && obtained != null && obtained >= cfg.passingMarks;
      return {
        subjectName: cfg.subjectName,
        maxMarks: cfg.maxMarks,
        passingMarks: cfg.passingMarks,
        examDate: cfg.examDate || null,
        marksObtained: obtained,
        isAbsent: absent,
        passed,
      };
    });

    return {exam, student, subjectRows, totalMax, totalObtained, percentage, grade, gradeLabel};
  },

  async getAnalytics(examId, sectionId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_EXAM_ANALYTICS, {
      examId,
      sectionId,
    });
    return computeAnalytics(
      data.students || [],
      data.studentMarks || [],
      data.examSubjectConfigs || [],
    );
  },

  // ─── Bulk upload helpers ────────────────────────────────────────────────────

  async downloadTemplate(students, subjectConfigs, fileName = 'marks_template.xlsx') {
    try {
      const XLSX = require('xlsx');
      const headers = ['Student ID', 'Admission No', 'Student Name', 'Subject', 'Marks Obtained'];
      const rows = [];
      for (const student of students) {
        for (const cfg of subjectConfigs) {
          rows.push([
            student.id,
            student.studentId,
            student.fullName,
            cfg.subjectName,
            '',
          ]);
        }
      }
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Marks');
      const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, wbout, 'base64');
      return path;
    } catch (err) {
      throw new Error(`Template generation failed: ${err.message}`);
    }
  },

  // Parse CSV or XLSX file at fileUri and return array of row objects.
  async parseBulkUploadFile(fileUri, mimeType) {
    const content = await RNFS.readFile(fileUri, 'utf8').catch(() =>
      RNFS.readFile(fileUri, 'base64'),
    );

    if (mimeType === CSV_MIME || fileUri.endsWith('.csv')) {
      return parseCsv(content);
    }

    // Excel parsing via xlsx
    const XLSX = require('xlsx');
    const workbook = XLSX.read(content, {type: 'base64'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});
    if (rawRows.length < 2) return [];
    const [headerRow, ...dataRows] = rawRows;
    return dataRows
      .filter(r => r.some(Boolean))
      .map((r, i) => {
        const obj = {rowNumber: i + 2};
        headerRow.forEach((h, j) => {
          obj[String(h).trim()] = r[j];
        });
        return obj;
      });
  },

  // Validate parsed rows against exam config and student list.
  validateBulkMarks(rows, students, subjectConfigs) {
    const studentById = Object.fromEntries(students.map(s => [s.studentId, s]));
    const studentByName = Object.fromEntries(students.map(s => [s.fullName?.toLowerCase(), s]));
    const subjectByName = Object.fromEntries(subjectConfigs.map(c => [c.subjectName?.toLowerCase(), c]));

    const valid = [];
    const invalid = [];

    for (const row of rows) {
      const rowNum = row.rowNumber || '?';
      const admNo = String(row['Admission No'] || row['Student ID'] || '').trim();
      const name = String(row['Student Name'] || '').trim();
      const subject = String(row['Subject'] || '').trim();
      const marksRaw = row['Marks Obtained'];

      const student = studentById[admNo] || studentByName[name.toLowerCase()];
      if (!student) {
        invalid.push({rowNumber: rowNum, studentName: name || admNo, error: 'Student not found in this section.'});
        continue;
      }

      const cfg = subjectByName[subject.toLowerCase()];
      if (!cfg) {
        invalid.push({rowNumber: rowNum, studentName: student.fullName, error: `Subject "${subject}" is not configured for this exam.`});
        continue;
      }

      const isAbsent = String(marksRaw).trim().toLowerCase() === 'ab' || String(marksRaw).trim().toLowerCase() === 'absent';
      const marks = isAbsent ? null : Number(marksRaw);

      if (!isAbsent) {
        if (isNaN(marks)) {
          invalid.push({rowNumber: rowNum, studentName: student.fullName, error: `Invalid marks value: "${marksRaw}". Use a number or "AB" for absent.`});
          continue;
        }
        if (marks < 0) {
          invalid.push({rowNumber: rowNum, studentName: student.fullName, error: 'Marks cannot be negative.'});
          continue;
        }
        if (marks > cfg.maxMarks) {
          invalid.push({rowNumber: rowNum, studentName: student.fullName, error: `Marks (${marks}) exceed maximum (${cfg.maxMarks}) for ${cfg.subjectName}.`});
          continue;
        }
      }

      valid.push({
        studentId: student.id,
        studentName: student.fullName,
        admissionNo: student.studentId,
        subjectName: cfg.subjectName,
        marksObtained: marks,
        isAbsent,
        rowNumber: rowNum,
      });
    }

    return {valid, invalid, total: rows.length, successCount: valid.length, failedCount: invalid.length};
  },
};

export default marksService;
