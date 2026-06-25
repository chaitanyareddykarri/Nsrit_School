import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {toISODate} from '../../utils/helpers/dateHelpers';

// Module-level cache keyed by branchId so multi-branch (main admin) stays isolated.
const _cache = {};

const JUNE = 5; // month index (0-based) — academic year switches in June

const calendarFallback = () => {
  const now = new Date();
  return now.getMonth() >= JUNE ? now.getFullYear() : now.getFullYear() - 1;
};

const academicYearService = {
  // Load active year for a branch and cache it.
  async loadForBranch(branchId) {
    if (!branchId) { return null; }
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ACTIVE_ACADEMIC_YEAR,
        {branchId},
      );
      const year = response?.academicYears?.[0] || null;
      _cache[branchId] = year;
      return year;
    } catch (err) {
      console.warn('[AcademicYear] loadForBranch error:', err.message);
      return null;
    }
  },

  // Returns cached active year for a branchId (null if none).
  getActiveYear(branchId) {
    return _cache[branchId] || null;
  },

  // Returns the startYear Int used as the year key across all DB tables.
  getCurrentStartYear(branchId) {
    const year = branchId ? _cache[branchId] : null;
    return year?.startYear ?? calendarFallback();
  },

  // True only when a year is ACTIVE and today falls within startDate–endDate.
  isYearActive(branchId) {
    const year = branchId ? _cache[branchId] : null;
    if (!year || year.status !== 'ACTIVE' || !year.isActive) { return false; }
    const today = toISODate();
    return today >= year.startDate && today <= year.endDate;
  },

  // Returns {startDate, endDate} or null.
  getActiveYearDates(branchId) {
    const year = branchId ? _cache[branchId] : null;
    if (!year) { return null; }
    return {startDate: year.startDate, endDate: year.endDate};
  },

  // Called on every app launch — auto-closes a year whose endDate has passed.
  async checkAndAutoClose(branchId) {
    if (!branchId) { return; }
    const year = _cache[branchId];
    if (!year || !year.isActive || year.status !== 'ACTIVE') { return; }
    const today = toISODate();
    if (today > year.endDate) {
      try {
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLOSE_ACADEMIC_YEAR, {id: year.id});
        _cache[branchId] = {...year, isActive: false, status: 'CLOSED'};
        console.log('[AcademicYear] Auto-closed expired year:', year.name);
      } catch (err) {
        console.warn('[AcademicYear] Auto-close failed:', err.message);
      }
    }
  },

  // Clear cache for a branch (e.g. after activation or closure).
  clearCache(branchId) {
    if (branchId) { delete _cache[branchId]; }
  },

  // ── CRUD operations ────────────────────────────────────────────────────────

  async getAcademicYears({branchId}) {
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_ACADEMIC_YEARS,
      {branchId},
    );
    return response?.academicYears || [];
  },

  async createAcademicYear({branchId, name, startYear, startDate, endDate}) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.CREATE_ACADEMIC_YEAR,
      {branchId, name, startYear, startDate, endDate},
    );
    return response?.academicYear_insert;
  },

  async updateAcademicYear({id, name, startDate, endDate}) {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_ACADEMIC_YEAR, {
      id,
      name,
      startDate,
      endDate,
    });
  },

  async activateAcademicYear({id, branchId}) {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ACTIVATE_ACADEMIC_YEAR, {id, branchId});
    this.clearCache(branchId);
    await this.loadForBranch(branchId);
  },

  async closeAcademicYear({id, branchId}) {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLOSE_ACADEMIC_YEAR, {id});
    this.clearCache(branchId);
    await this.loadForBranch(branchId);
  },

  // ── Promotion operations ───────────────────────────────────────────────────

  async recordStudentPromotion({
    branchId, studentId, fromClassId, fromSectionId,
    toClassId, toSectionId, promotionStatus, academicYear, remarks,
  }) {
    return dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.RECORD_STUDENT_PROMOTION, {
      branchId,
      studentId,
      fromClassId,
      fromSectionId,
      toClassId: toClassId || null,
      toSectionId: toSectionId || null,
      promotionStatus,
      academicYear,
      remarks: remarks || null,
    });
  },

  async applyStudentPromotion({
    studentId, toSectionId, toClassId,
    branchId, fromClassId, fromSectionId, academicYear, promotionStatus = 'PROMOTED',
  }) {
    return dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.APPLY_STUDENT_PROMOTION, {
      studentId,
      toSectionId,
      toClassId,
      branchId,
      fromClassId,
      fromSectionId,
      academicYear,
      promotionStatus,
    });
  },

  async getPromotionHistory({branchId, academicYear}) {
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_BRANCH_PROMOTION_HISTORY,
      {branchId, academicYear: academicYear || null},
    );
    return response?.studentPromotionHistories || [];
  },
};

export default academicYearService;
