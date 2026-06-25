import dataConnectClient from '../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../services/dataconnect/operations';
import academicYearService from '../services/academicYear/academicYearService';

const currentAcademicYear = (branchId) => academicYearService.getCurrentStartYear(branchId);

export const academicRepository = {
  async getAcademicClasses(options = {}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACADEMIC_CLASSES, {
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
    return response.academicClasses || [];
  },

  async getActiveAcademicClasses(options = {}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACTIVE_ACADEMIC_CLASSES, {
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
    return response.academicClasses || [];
  },

  async getClassesByWing(wingCode, options = {}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASSES_BY_WING_CODE, {
      wingCode,
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
    return response.academicClasses || [];
  },

  async activateClass(classId) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ACTIVATE_CLASS, {
      classId,
    });
    return response.academicClass_update;
  },

  async deactivateClass(classId) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.DEACTIVATE_CLASS, {
      classId,
    });
    return response.academicClass_update;
  },

  async getPrincipalDashboard(branchId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PRINCIPAL_DASHBOARD, {
      branchId,
    });
    return response;
  },

  async getCoordinators(branchId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATORS, {
      branchId,
    });
    return response.coordinators || [];
  },

  async getCoordinatorDetails(coordinatorId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_DETAILS, {
      coordinatorId,
    });
    return response.coordinator || null;
  },

  async createCoordinator(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.CREATE_COORDINATOR,
      payload,
    );
    return response.coordinator_insert;
  },

  async updateCoordinator(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.UPDATE_COORDINATOR,
      {
        coordinatorId: payload.coordinatorId,
        userId: payload.userId,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        email: payload.email || null,
        gender: payload.gender || null,
        employeeId: payload.employeeId || null,
        wing: payload.wing,
        isActive: payload.isActive,
        branchId: payload.branchId,
      },
    );
    return response.coordinator_update;
  },

  async getSections({branchId, academicYear = currentAcademicYear(branchId), limit = 100, offset = 0}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_SECTIONS, {
      branchId,
      academicYear,
      limit,
      offset,
    });
    return {
      sections: response.sections || [],
      students: response.students || [],
      attendances: response.attendances || [],
    };
  },

  async getSectionsByClassAndYear({branchId, academicClassId, academicYear = currentAcademicYear(branchId)}) {
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_SECTIONS_BY_CLASS_AND_YEAR,
      {
        branchId,
        academicClassId,
        academicYear,
      },
    );
    return response.sections || [];
  },

  async createSection(payload) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_SECTION, {
      branchId: payload.branchId,
      wingId: payload.wingId,
      academicClassId: payload.academicClassId,
      name: payload.name,
      academicYear: payload.academicYear || currentAcademicYear(payload.branchId),
    });
    return response.section_insert;
  },

  async updateSection(payload) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_SECTION, {
      sectionId: payload.sectionId,
      name: payload.name,
      academicYear: payload.academicYear || currentAcademicYear(payload.branchId),
      isActive: payload.isActive,
    });
    return response.section_update;
  },

  async assignClassTeacher(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.ASSIGN_CLASS_TEACHER,
      {
        sectionId: payload.sectionId,
        teacherId: payload.teacherId,
        teacherUserId: payload.teacherUserId,
        branchId: payload.branchId,
      },
    );
    return response.teacherSectionAssignment_insert || response.section_update;
  },

  async getTeachersByBranch(branchId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHERS, {
      branchId,
      limit: 500,
      offset: 0,
    });
    return response.teachers || [];
  },

  async getPromotionHistory(studentId = null) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PROMOTION_HISTORY, {
      studentId,
    });
    return response.studentPromotionHistories || [];
  },
};

export default academicRepository;
