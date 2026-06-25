import {EXAM_STATUS, USER_ROLES} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

const CACHE_TTL = 60 * 1000;
const cache = new Map();

const readCache = key => {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.createdAt > CACHE_TTL) return null;
  return entry.value;
};

const writeCache = (key, value) => {
  cache.set(key, {createdAt: Date.now(), value});
  return value;
};

const withCache = async (key, loader, forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = readCache(key);
    if (cached) return cached;
  }
  const value = await loader();
  return writeCache(key, value);
};

const invalidate = (...prefixes) => {
  for (const key of cache.keys()) {
    if (prefixes.some(p => key.startsWith(p))) cache.delete(key);
  }
};

// Roles that can create/edit exams and manage subject configs.
export const canManageExams = role => {
  const r = String(role || '').toUpperCase();
  return [USER_ROLES.PRINCIPAL, USER_ROLES.COORDINATOR, USER_ROLES.MAIN_ADMIN].includes(r);
};

// Roles that can publish or unpublish results.
export const canPublishResults = role => {
  const r = String(role || '').toUpperCase();
  return [USER_ROLES.PRINCIPAL, USER_ROLES.COORDINATOR, USER_ROLES.MAIN_ADMIN].includes(r);
};

// Only principals can permanently delete or unpublish exams.
export const canDeleteExam = role => {
  const r = String(role || '').toUpperCase();
  return [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(r);
};

export const canUnpublishResults = role => {
  const r = String(role || '').toUpperCase();
  return [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(r);
};

// Teachers, principals, coordinators can enter marks.
export const canEnterMarks = role => {
  const r = String(role || '').toUpperCase();
  return [
    USER_ROLES.PRINCIPAL,
    USER_ROLES.COORDINATOR,
    USER_ROLES.TEACHER,
    USER_ROLES.CLASS_TEACHER,
    USER_ROLES.MAIN_ADMIN,
  ].includes(r);
};

const examService = {
  async createExam({branchId, academicYearId, name, examType, startDate, endDate, remarks, createdById}) {
    if (!canManageExams) throw new Error('You do not have permission to create exams.');
    if (!name?.trim()) throw new Error('Exam name is required.');
    if (!examType) throw new Error('Exam type is required.');

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_EXAM, {
      branchId,
      academicYearId,
      name: name.trim(),
      examType,
      startDate: startDate || null,
      endDate: endDate || null,
      remarks: remarks?.trim() || null,
      createdById,
    });

    invalidate(`exams:${branchId}`);
    return response.exam_insert;
  },

  async updateExam(id, {name, examType, startDate, endDate, remarks}) {
    if (!name?.trim()) throw new Error('Exam name is required.');

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_EXAM, {
      id,
      name: name.trim(),
      examType,
      startDate: startDate || null,
      endDate: endDate || null,
      remarks: remarks?.trim() || null,
    });

    invalidate(`exam:${id}`, 'exams:');
  },

  async archiveExam(id, role) {
    if (!canDeleteExam(role)) throw new Error('Only principals can archive exams.');
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ARCHIVE_EXAM, {id});
    invalidate(`exam:${id}`, 'exams:');
  },

  async deleteExam(id, role) {
    if (!canDeleteExam(role)) throw new Error('Only principals can delete exams.');
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.DELETE_EXAM, {id});
    invalidate(`exam:${id}`, 'exams:');
  },

  async getExams(branchId, academicYearId, forceRefresh = false) {
    const key = `exams:${branchId}:${academicYearId}`;
    return withCache(
      key,
      async () => {
        const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_EXAMS_BY_BRANCH, {
          branchId,
          academicYearId,
          limit: 100,
          offset: 0,
        });
        return (data.exams || []).map(normalizeExam);
      },
      forceRefresh,
    );
  },

  async getExamDetails(examId, forceRefresh = false) {
    const key = `exam:${examId}`;
    return withCache(
      key,
      async () => {
        const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_EXAM_DETAILS, {examId});
        const exam = (data.exams || [])[0];
        if (!exam) throw new Error('Exam not found.');
        return normalizeExam(exam);
      },
      forceRefresh,
    );
  },

  async addSectionToExam(examId, sectionId, academicClassId, branchId) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ADD_EXAM_SECTION, {
      examId,
      sectionId,
      academicClassId,
      branchId,
    });
    invalidate(`exam:${examId}`, 'exams:');
    return response.examSection_insert;
  },

  async upsertSubjectConfig({examId, academicClassId, branchId, subjectName, maxMarks, passingMarks}) {
    if (!subjectName?.trim()) throw new Error('Subject name is required.');
    if (maxMarks <= 0) throw new Error('Maximum marks must be greater than 0.');
    if (passingMarks < 0 || passingMarks > maxMarks) {
      throw new Error('Passing marks must be between 0 and maximum marks.');
    }

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPSERT_EXAM_SUBJECT_CONFIG, {
      examId,
      academicClassId,
      branchId,
      subjectName: subjectName.trim(),
      maxMarks: Number(maxMarks),
      passingMarks: Number(passingMarks),
    });
    invalidate(`exam:${examId}`);
  },

  // Creates a new DRAFT exam copying name, type, subjects from an existing exam.
  async duplicateExam(sourceExamId, newName, branchId, academicYearId, createdById) {
    const source = await this.getExamDetails(sourceExamId);
    const newExam = await this.createExam({
      branchId,
      academicYearId,
      name: newName || `${source.name} (Copy)`,
      examType: source.examType,
      startDate: null,
      endDate: null,
      remarks: source.remarks,
      createdById,
    });

    // Copy subject configs for each unique class in the source.
    const configs = source.examSubjectConfigs || [];
    for (const cfg of configs) {
      await this.upsertSubjectConfig({
        examId: newExam.id,
        academicClassId: cfg.academicClassId,
        branchId,
        subjectName: cfg.subjectName,
        maxMarks: cfg.maxMarks,
        passingMarks: cfg.passingMarks,
      });
    }

    return newExam;
  },
};

// Normalise raw API response into a flat, predictable shape.
function normalizeExam(raw) {
  return {
    id: raw.id,
    name: raw.name,
    examType: raw.examType,
    status: raw.status,
    startDate: raw.startDate,
    endDate: raw.endDate,
    remarks: raw.remarks,
    branchId: raw.branchId,
    academicYearId: raw.academicYearId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    academicYear: raw.academicYear || null,
    examSections: (raw.examSections_on_exam || []).map(s => ({
      id: s.id,
      sectionId: s.sectionId,
      academicClassId: s.academicClassId,
      isPublished: s.isPublished,
      publishedAt: s.publishedAt,
      publishedBy: s.publishedBy,
      section: s.section,
    })),
    examSubjectConfigs: (raw.examSubjectConfigs_on_exam || []).map(c => ({
      id: c.id,
      subjectName: c.subjectName,
      maxMarks: c.maxMarks,
      passingMarks: c.passingMarks,
      academicClassId: c.academicClassId,
    })),
  };
}

export default examService;
