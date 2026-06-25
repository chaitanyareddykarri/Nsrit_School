import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES, DATA_CONNECT_MUTATIONS} from '../dataconnect/operations';
import {HOLIDAY_TYPES, HOLIDAY_TYPE_LABELS} from '../../config/constants';
import {notificationService} from '../notifications/notificationService';

// In-memory cache keyed by `branchId|YYYY-MM`
const cache = {};

const monthKey = (branchId, yearMonth) => `${branchId}|${yearMonth}`;

const getMonthRange = yearMonth => {
  const [year, month] = yearMonth.split('-');
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    fromDate: `${year}-${month}-01`,
    toDate:   `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
};

// ── India Public Holidays seed list ───────────────────────────────────────────
// Fixed-date national + major festival holidays for any given calendar year.
// Variable-date festivals (Eid, Diwali, etc.) use approximate dates that the
// Principal can adjust after seeding.

const FIXED_NATIONAL = [
  {mmdd: '01-26', name: 'Republic Day',         type: HOLIDAY_TYPES.NATIONAL,  description: 'National holiday — Government of India'},
  {mmdd: '08-15', name: 'Independence Day',      type: HOLIDAY_TYPES.NATIONAL,  description: 'National holiday — Government of India'},
  {mmdd: '10-02', name: 'Gandhi Jayanti',        type: HOLIDAY_TYPES.NATIONAL,  description: 'National holiday — Government of India'},
  {mmdd: '04-14', name: 'Dr. Ambedkar Jayanti',  type: HOLIDAY_TYPES.NATIONAL,  description: 'National holiday'},
  {mmdd: '12-25', name: 'Christmas Day',         type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
  {mmdd: '11-01', name: 'AP Formation Day',      type: HOLIDAY_TYPES.STATE,     description: 'Andhra Pradesh State Formation Day'},
];

// Approximate festival dates by start year of academic year.
// The academic year starts in June, so year=2025 → Jun 2025 – Mar 2026.
// Dates here are for commonly observed holidays; Principal may edit after seeding.
const FESTIVAL_BY_YEAR = {
  // key = startYear of AY (the year in which June falls)
  2024: [
    {date: '2024-08-19', name: 'Raksha Bandhan',      type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2024-09-07', name: 'Janmashtami',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2024-10-02', name: 'Dussehra',             type: HOLIDAY_TYPES.FESTIVAL,  description: 'Vijaya Dashami — Festival holiday'},
    {date: '2024-10-31', name: 'Halloween / Diwali',   type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali — Festival of Lights'},
    {date: '2024-11-01', name: 'Diwali (Day 2)',       type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali holiday'},
    {date: '2024-11-15', name: 'Guru Nanak Jayanti',   type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2025-03-14', name: 'Holi',                 type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival of colours'},
    {date: '2025-03-31', name: 'Eid-ul-Fitr',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday — approximate date'},
  ],
  2025: [
    {date: '2025-07-10', name: 'Eid-ul-Adha',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday — approximate date'},
    {date: '2025-08-09', name: 'Muharram',             type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday — approximate date'},
    {date: '2025-08-16', name: 'Janmashtami',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2025-10-02', name: 'Dussehra',             type: HOLIDAY_TYPES.FESTIVAL,  description: 'Vijaya Dashami'},
    {date: '2025-10-20', name: 'Diwali',               type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali — Festival of Lights'},
    {date: '2025-10-21', name: 'Diwali (Day 2)',       type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali holiday'},
    {date: '2025-11-05', name: 'Guru Nanak Jayanti',   type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2026-03-20', name: 'Holi',                 type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival of colours'},
    {date: '2026-03-20', name: 'Good Friday',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
  ],
  2026: [
    {date: '2026-06-27', name: 'Eid-ul-Adha',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday — approximate date'},
    {date: '2026-08-05', name: 'Janmashtami',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2026-10-19', name: 'Dussehra',             type: HOLIDAY_TYPES.FESTIVAL,  description: 'Vijaya Dashami'},
    {date: '2026-11-08', name: 'Diwali',               type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali — Festival of Lights'},
    {date: '2026-11-09', name: 'Diwali (Day 2)',       type: HOLIDAY_TYPES.FESTIVAL,  description: 'Diwali holiday'},
    {date: '2026-11-24', name: 'Guru Nanak Jayanti',   type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
    {date: '2027-03-09', name: 'Holi',                 type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival of colours'},
    {date: '2027-04-02', name: 'Good Friday',          type: HOLIDAY_TYPES.FESTIVAL,  description: 'Festival holiday'},
  ],
};

/**
 * Build the full list of public holiday objects for a given AY date range.
 * startYear: Int (year in which June falls, e.g. 2025 for AY 2025-26)
 * ayStartDate: 'YYYY-MM-DD', ayEndDate: 'YYYY-MM-DD'
 */
const buildPublicHolidayList = (startYear, ayStartDate, ayEndDate) => {
  const holidays = [];

  // Fixed-date nationals: check for each calendar year that overlaps the AY
  for (let yr = startYear; yr <= startYear + 1; yr++) {
    for (const h of FIXED_NATIONAL) {
      const date = `${yr}-${h.mmdd}`;
      if (date >= ayStartDate && date <= ayEndDate) {
        holidays.push({...h, date});
      }
    }
  }

  // Festival/variable holidays
  const festivalList = FESTIVAL_BY_YEAR[startYear] || [];
  for (const h of festivalList) {
    if (h.date >= ayStartDate && h.date <= ayEndDate) {
      holidays.push(h);
    }
  }

  // De-duplicate by date (in case a festival lands on a national holiday)
  const seen = new Set();
  return holidays.filter(h => {
    if (seen.has(h.date)) { return false; }
    seen.add(h.date);
    return true;
  }).sort((a, b) => (a.date > b.date ? 1 : -1));
};

export const holidayService = {
  // Returns {[dateStr]: {id, name, type, description, isPublicHoliday}} for a month
  async getHolidayMonthMap(branchId, yearMonth) {
    const key = monthKey(branchId, yearMonth);
    if (cache[key]) { return cache[key]; }

    const {fromDate, toDate} = getMonthRange(yearMonth);
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_HOLIDAYS_BY_MONTH,
      {branchId, fromDate, toDate},
    );

    const map = {};
    (response.holidays || []).forEach(h => {
      map[h.date] = {
        id: h.id, name: h.name, type: h.type,
        description: h.description, isPublicHoliday: h.isPublicHoliday,
      };
    });

    cache[key] = map;
    return map;
  },

  // Full list with metadata — for management screen
  async getHolidaysByBranch(branchId, fromDate, toDate) {
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_HOLIDAYS_BY_BRANCH,
      {branchId, fromDate, toDate},
    );
    return response.holidays || [];
  },

  async createHoliday({branchId, name, date, type, description, createdById, createdByRole = null, createdByName = null}) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_HOLIDAY, {
      branchId, name, date, type, description: description || null, createdById,
    });
    this.clearCache(branchId, date);
    const typeLabel = HOLIDAY_TYPE_LABELS[type] || 'Holiday';
    const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    notificationService.broadcastNotification({
      branchId,
      title: `Holiday Declared — ${name}`,
      message: `${name} (${typeLabel}) has been declared a holiday on ${dateLabel}. School will remain closed.`,
      target: 'all',
      senderId: createdById,
      senderName: createdByName,
      senderRole: createdByRole,
    }).catch(err => console.warn('[HolidayService] notification failed:', err.message));
    return response.holiday_insert;
  },

  async updateHoliday({id, name, date, type, description, updatedById, updatedByRole = null, updatedByName = null, branchId = null}) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_HOLIDAY, {
      id, name, date, type, description: description || null, updatedById,
    });
    this.clearCacheById(id);
    if (branchId && date) {
      this.clearCache(branchId, date);
      const typeLabel = HOLIDAY_TYPE_LABELS[type] || 'Holiday';
      const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      notificationService.broadcastNotification({
        branchId,
        title: `Holiday Updated — ${name}`,
        message: `${name} (${typeLabel}) on ${dateLabel} has been updated. School will remain closed on this day.`,
        target: 'all',
        senderId: updatedById,
        senderName: updatedByName,
        senderRole: updatedByRole,
      }).catch(err => console.warn('[HolidayService] update notification failed:', err.message));
    }
    return response.holiday_update;
  },

  async deleteHoliday({id, deletedById, branchId, date}) {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.DELETE_HOLIDAY, {id, deletedById});
    this.clearCache(branchId, date);
  },

  /**
   * Seed all India public holidays for the active academic year.
   * Skips dates that already have a holiday record.
   * Returns {seeded: number, skipped: number}
   */
  async seedPublicHolidays({branchId, startYear, ayStartDate, ayEndDate, createdById}) {
    const toSeed = buildPublicHolidayList(startYear, ayStartDate, ayEndDate);

    // Fetch existing holidays for the AY range to avoid duplicates
    const existing = await this.getHolidaysByBranch(branchId, ayStartDate, ayEndDate);
    const existingDates = new Set(existing.map(h => h.date));

    let seeded = 0;
    let skipped = 0;
    for (const h of toSeed) {
      if (existingDates.has(h.date)) { skipped++; continue; }
      try {
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_PUBLIC_HOLIDAY, {
          branchId,
          name: h.name,
          date: h.date,
          type: h.type,
          description: h.description || null,
          createdById,
          isPublicHoliday: true,
          isSeeded: true,
        });
        this.clearCache(branchId, h.date);
        seeded++;
      } catch (err) {
        console.warn('[HolidayService] seed failed for', h.date, err.message);
        skipped++;
      }
    }
    return {seeded, skipped, total: toSeed.length};
  },

  buildPublicHolidayList,

  clearCache(branchId, date) {
    if (date) {
      const yearMonth = date.slice(0, 7);
      delete cache[monthKey(branchId, yearMonth)];
    } else {
      Object.keys(cache).forEach(k => {
        if (k.startsWith(`${branchId}|`)) { delete cache[k]; }
      });
    }
  },

  clearCacheById(id) {
    Object.keys(cache).forEach(k => {
      const map = cache[k];
      if (Object.values(map).some(h => h.id === id)) { delete cache[k]; }
    });
  },
};

export default holidayService;
