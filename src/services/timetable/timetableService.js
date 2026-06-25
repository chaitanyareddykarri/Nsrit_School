import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES, DATA_CONNECT_MUTATIONS} from '../dataconnect/operations';
import {USER_ROLES, TIMETABLE_STATUS} from '../../config/constants';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MAX_PERIODS = 8;

// ── Permission helpers ────────────────────────────────────────────────────────

const normalizeRole = r => String(r || '').toUpperCase();

export const canManageTimetable = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.COORDINATOR, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

export const canPublishTimetable = role => canManageTimetable(role);

export const canDeleteTimetable = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

// ── Data normalizer ───────────────────────────────────────────────────────────

const toPeriod = row => ({
  id: `${row.sectionId}-${row.day}-${row.periodNum}`,
  sectionId: row.sectionId,
  branchId: row.branchId,
  teacherId: row.teacherId || '',
  day: row.day,
  periodNum: row.periodNum,
  subject: row.subject || '',
  teacherName: row.teacherName || '',
  room: row.room || '',
  status: row.status || TIMETABLE_STATUS.DRAFT,
  startTime: row.startTime || '',
  endTime: row.endTime || '',
  timetableType: row.timetableType || 'REGULAR',
  publishedAt: row.publishedAt || null,
  publishedById: row.publishedById || null,
});

// Groups a flat periods array by sectionId, attaching class/section metadata
const groupBySection = (allPeriods, rawRows) => {
  const map = {};
  allPeriods.forEach(p => {
    if (!map[p.sectionId]) {
      const raw = rawRows.find(r => r.sectionId === p.sectionId);
      map[p.sectionId] = {
        sectionId: p.sectionId,
        branchId: p.branchId,
        className: raw?.section?.academicClass?.name || '',
        sectionName: raw?.section?.name || '',
        wingId: raw?.section?.wingId || '',
        periods: [],
      };
    }
    map[p.sectionId].periods.push(p);
  });
  return Object.values(map);
};

// ── Timetable status helper ───────────────────────────────────────────────────

export const getTimetableStatus = periods => {
  const totalSlots = DAYS.length * MAX_PERIODS;
  const filledCount = (periods || []).filter(p => p.subject).length;
  if (!periods || periods.length === 0) {
    return {status: 'EMPTY', filledCount: 0, totalSlots};
  }
  const isPublished = periods.some(p => p.status === TIMETABLE_STATUS.PUBLISHED);
  return {
    status: isPublished ? TIMETABLE_STATUS.PUBLISHED : TIMETABLE_STATUS.DRAFT,
    filledCount,
    totalSlots,
  };
};

// ── Core queries ──────────────────────────────────────────────────────────────

const timetableService = {
  DAYS,
  MAX_PERIODS,

  async getTimetableForSection(sectionId) {
    if (!sectionId) {return null;}
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_TIMETABLE_FOR_SECTION,
        {sectionId},
      );
      const periods = (response.timetablePeriods || []).map(toPeriod);
      return {sectionId, periods};
    } catch (err) {
      console.warn('[TimetableService] getTimetableForSection failed:', err?.message);
      return null;
    }
  },

  async getTimetablesForBranch(branchId) {
    if (!branchId) {return [];}
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_TIMETABLES_FOR_BRANCH,
        {branchId},
      );
      const allPeriods = (response.timetablePeriods || []).map(toPeriod);
      return groupBySection(allPeriods, response.timetablePeriods || []);
    } catch (err) {
      console.warn('[TimetableService] getTimetablesForBranch failed:', err?.message);
      return [];
    }
  },

  async getTimetablesForWing(branchId, wingId) {
    if (!branchId || !wingId) {return [];}
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_TIMETABLES_FOR_WING,
        {branchId, wingId},
      );
      const allPeriods = (response.timetablePeriods || []).map(toPeriod);
      return groupBySection(allPeriods, response.timetablePeriods || []);
    } catch (err) {
      console.warn('[TimetableService] getTimetablesForWing failed:', err?.message);
      return [];
    }
  },

  async getTimetablesForTeacher(teacherId, branchId) {
    if (!teacherId || !branchId) {return [];}
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_TIMETABLE_FOR_TEACHER,
        {teacherId, branchId},
      );
      const allPeriods = (response.timetablePeriods || []).map(toPeriod);
      return groupBySection(allPeriods, response.timetablePeriods || []);
    } catch (err) {
      console.warn('[TimetableService] getTimetablesForTeacher failed:', err?.message);
      return [];
    }
  },

  buildEmptyTimetable(branchId, classId, className, sectionId, sectionName) {
    const periods = [];
    for (const day of DAYS) {
      for (let periodNum = 1; periodNum <= MAX_PERIODS; periodNum++) {
        periods.push({day, periodNum, subject: '', teacherId: '', teacherName: '', room: '', startTime: '', endTime: ''});
      }
    }
    return {branchId, classId, className, sectionId, sectionName, periods};
  },

  // ── Mutations ────────────────────────────────────────────────────────────────

  // Legacy method (principal/main_admin only) — kept for backward compatibility
  async updatePeriod(sectionId, day, periodNum, {subject, teacherId, teacherName, room}, branchId) {
    if (!sectionId) {throw new Error('Section ID required.');}
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPSERT_TIMETABLE_PERIOD, {
      sectionId,
      branchId: branchId || '',
      day,
      periodNum,
      subject: subject || '',
      teacherId: teacherId || null,
      teacherName: teacherName || '',
      room: room || '',
    });
  },

  // Full period update — supports coordinator + all new fields
  async updatePeriodFull(sectionId, day, periodNum, payload, branchId) {
    if (!sectionId) {throw new Error('Section ID required.');}
    const {subject, teacherId, teacherName, room, startTime, endTime, status, timetableType} = payload;
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPSERT_TIMETABLE_PERIOD_FULL, {
      sectionId,
      branchId: branchId || '',
      day,
      periodNum,
      subject: subject || '',
      teacherId: teacherId || null,
      teacherName: teacherName || '',
      room: room || '',
      startTime: startTime || null,
      endTime: endTime || null,
      status: status || TIMETABLE_STATUS.DRAFT,
      timetableType: timetableType || 'REGULAR',
    });
  },

  async deleteTimetable(sectionId, branchId) {
    if (!sectionId) {throw new Error('Section ID required.');}
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLEAR_TIMETABLE_FOR_SECTION, {
      sectionId,
      branchId: branchId || '',
    });
  },

  // ── Publish / Unpublish ───────────────────────────────────────────────────────

  async publishTimetable(sectionId, branchId, publishedById, role) {
    if (!canPublishTimetable(role)) {
      throw new Error('You do not have permission to publish timetables.');
    }
    if (!sectionId || !branchId || !publishedById) {
      throw new Error('Section, branch, and publisher ID are required.');
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.PUBLISH_TIMETABLE_SECTION, {
      sectionId,
      branchId,
      publishedById,
    });
  },

  async unpublishTimetable(sectionId, branchId, role) {
    if (!canDeleteTimetable(role)) {
      throw new Error('Only principals can unpublish timetables.');
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UNPUBLISH_TIMETABLE_SECTION, {
      sectionId,
      branchId,
    });
  },

  // ── Conflict Detection ────────────────────────────────────────────────────────

  // Returns conflicting section info or null. Caller passes all sections for the branch.
  detectTeacherConflict(teacherId, day, periodNum, allSectionTimetables, excludeSectionId) {
    if (!teacherId) {return null;}
    for (const tt of allSectionTimetables) {
      if (tt.sectionId === excludeSectionId) {continue;}
      const conflict = (tt.periods || []).find(
        p => p.teacherId === teacherId && p.day === day && p.periodNum === periodNum && p.subject,
      );
      if (conflict) {
        return {sectionId: tt.sectionId, className: tt.className, sectionName: tt.sectionName};
      }
    }
    return null;
  },

  // ── Validation ────────────────────────────────────────────────────────────────

  validateTimetable(periods) {
    const totalSlots = DAYS.length * MAX_PERIODS;
    const allFilled = (periods || []).filter(p => p.subject);
    const filledCount = allFilled.length;
    const errors = [];
    const warnings = [];

    // Only regular periods need a teacher — breaks do not
    const regularPeriods = allFilled.filter(
      p => p.timetableType !== 'LUNCH' && p.timetableType !== 'BREAK',
    );

    regularPeriods.forEach(p => {
      if (!p.teacherName && !p.teacherId) {
        errors.push({day: p.day, periodNum: p.periodNum, message: `${p.day} Period ${p.periodNum}: Subject "${p.subject}" has no teacher assigned.`});
      }
    });

    // Distribution check based on regular periods only
    const periodsPerDay = {};
    DAYS.forEach(d => {
      periodsPerDay[d] = regularPeriods.filter(p => p.day === d).length;
    });
    const regularCount = regularPeriods.length;
    const avgPerDay = regularCount / DAYS.length;
    DAYS.forEach(d => {
      if (periodsPerDay[d] < avgPerDay * 0.5 && periodsPerDay[d] > 0) {
        warnings.push(`${d} has only ${periodsPerDay[d]} period(s) (average is ${Math.round(avgPerDay)}).`);
      }
    });

    return {isValid: errors.length === 0, errors, warnings, filledCount, totalSlots};
  },

  // ── Copy Timetable ────────────────────────────────────────────────────────────

  async copyTimetable(fromSectionId, toSectionId, branchId, role) {
    if (!canManageTimetable(role)) {
      throw new Error('You do not have permission to copy timetables.');
    }
    const source = await this.getTimetableForSection(fromSectionId);
    if (!source?.periods?.length) {
      throw new Error('Source timetable has no periods to copy.');
    }
    const filledPeriods = source.periods.filter(p => p.subject);
    for (const p of filledPeriods) {
      await this.updatePeriodFull(toSectionId, p.day, p.periodNum, {
        subject: p.subject,
        teacherId: p.teacherId || null,
        teacherName: p.teacherName,
        room: p.room,
        startTime: p.startTime,
        endTime: p.endTime,
        status: TIMETABLE_STATUS.DRAFT,
        timetableType: p.timetableType,
      }, branchId);
    }
    return filledPeriods.length;
  },

  // ── Teacher Schedule Stats ────────────────────────────────────────────────────

  getTeacherScheduleStats(timetables, teacherId) {
    const today = new Date().toLocaleDateString('en-US', {weekday: 'long'}); // e.g. "Monday"
    const allPeriods = [];
    for (const tt of timetables) {
      for (const p of tt.periods || []) {
        if (p.teacherId === teacherId && p.subject) {
          allPeriods.push({
            ...p,
            sectionLabel: `${tt.className} ${tt.sectionName}`,
          });
        }
      }
    }

    const todayPeriods = allPeriods
      .filter(p => p.day === today)
      .sort((a, b) => a.periodNum - b.periodNum);

    const weekTotal = allPeriods.length;
    const freePeriods = MAX_PERIODS * DAYS.length - weekTotal;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;

    const nextPeriod = todayPeriods.find(p => {
      if (!p.startTime) {return p.periodNum > todayPeriods[0]?.periodNum;}
      const [h, m] = (p.startTime || '00:00').split(':').map(Number);
      return h * 60 + m >= currentMinutes;
    });

    return {todayPeriods, weekTotal, freePeriods, nextPeriod, today};
  },

  // ── Bulk Import ───────────────────────────────────────────────────────────────

  getBulkTemplateCSV() {
    const header = 'Day,Period,StartTime,EndTime,Class,Section,Subject,Teacher,Room';
    const example = 'Monday,1,09:00,09:45,Class I,A,Mathematics,John Smith,Room 101';
    return `${header}\n${example}\n`;
  },

  parseBulkImportCSV(csvText) {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {return [];}
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map((line, i) => {
      const vals = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => {row[h] = vals[idx] || '';});
      row._rowNum = i + 2;
      return row;
    });
  },

  validateBulkRows(rows, {sections, teachers}) {
    const valid = [];
    const invalid = [];
    const sectionMap = {};
    sections.forEach(s => {
      const key = `${(s.className || '').toLowerCase()}__${(s.sectionName || '').toLowerCase()}`;
      sectionMap[key] = s;
    });
    const teacherMap = {};
    (teachers || []).forEach(t => {
      teacherMap[(t.name || '').toLowerCase()] = t;
    });

    const daySet = new Set(DAYS.map(d => d.toLowerCase()));

    rows.forEach(row => {
      const errors = [];
      const day = (row.day || '').trim();
      const periodNum = parseInt(row.period, 10);
      const className = (row.class || '').trim();
      const sectionName = (row.section || '').trim();
      const subject = (row.subject || '').trim();
      const teacherName = (row.teacher || '').trim();

      if (!daySet.has(day.toLowerCase())) {
        errors.push(`Invalid day: "${day}"`);
      }
      if (isNaN(periodNum) || periodNum < 1 || periodNum > MAX_PERIODS) {
        errors.push(`Invalid period: "${row.period}" (must be 1–${MAX_PERIODS})`);
      }
      if (!subject) {
        errors.push('Subject is required');
      }

      const sectionKey = `${className.toLowerCase()}__${sectionName.toLowerCase()}`;
      const matchedSection = sectionMap[sectionKey];
      if (!matchedSection) {
        errors.push(`Section not found: "${className} ${sectionName}"`);
      }

      let matchedTeacher = null;
      if (teacherName) {
        matchedTeacher = teacherMap[teacherName.toLowerCase()];
        if (!matchedTeacher) {
          errors.push(`Teacher not found: "${teacherName}"`);
        }
      }

      if (errors.length > 0) {
        invalid.push({rowNum: row._rowNum, className, sectionName, errors: errors.join('; ')});
      } else {
        valid.push({
          rowNum: row._rowNum,
          sectionId: matchedSection.sectionId,
          day: DAYS.find(d => d.toLowerCase() === day.toLowerCase()),
          periodNum,
          subject,
          teacherId: matchedTeacher?.id || null,
          teacherName: matchedTeacher?.name || teacherName,
          room: row.room || '',
          startTime: row.starttime || row.startTime || '',
          endTime: row.endtime || row.endTime || '',
        });
      }
    });

    return {valid, invalid, successCount: valid.length, failedCount: invalid.length};
  },

  async applyBellSchedule(sectionId, branchId, periodTimes, role) {
    if (!canManageTimetable(role)) {
      throw new Error('You do not have permission to update the bell schedule.');
    }
    const timetable = await this.getTimetableForSection(sectionId);
    const filled = (timetable?.periods || []).filter(p => p.subject);
    for (const p of filled) {
      const times = periodTimes[p.periodNum];
      // Skip if this period's entry was left blank — don't wipe existing times
      if (!times || (!times.startTime && !times.endTime)) {continue;}
      await this.updatePeriodFull(sectionId, p.day, p.periodNum, {
        subject: p.subject,
        teacherId: p.teacherId || null,
        teacherName: p.teacherName,
        room: p.room,
        startTime: times.startTime || '',
        endTime: times.endTime || '',
        status: p.status,
        timetableType: p.timetableType || 'REGULAR',
      }, branchId);
    }
  },

  async importBulkTimetable(validRows, branchId, role) {
    if (!canManageTimetable(role)) {
      throw new Error('You do not have permission to import timetables.');
    }
    let imported = 0;
    const failed = [];
    const sectionIds = new Set();

    for (const row of validRows) {
      try {
        await this.updatePeriodFull(row.sectionId, row.day, row.periodNum, {
          subject: row.subject,
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          room: row.room,
          startTime: row.startTime,
          endTime: row.endTime,
          status: TIMETABLE_STATUS.DRAFT,
          timetableType: 'REGULAR',
        }, branchId);
        imported++;
        sectionIds.add(row.sectionId);
      } catch (err) {
        failed.push({rowNum: row.rowNum, error: err?.message || 'Unknown error'});
      }
    }

    return {imported, failed, sectionCount: sectionIds.size};
  },
};

export default timetableService;
