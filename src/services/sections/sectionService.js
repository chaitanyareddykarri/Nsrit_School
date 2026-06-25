import academicRepository from '../../repositories/academicRepository';
import {SECTION_NAMES} from '../../config/academic';
import {assertBranchAccess, assertCoordinatorWing} from '../academics/academicAccess';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

export const sectionService = {
  async getSectionsByClass(academicClassId) {
    if (!academicClassId) {
      return [];
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_SECTIONS_BY_CLASS, {
      academicClassId,
    });
    return response.sections || [];
  },

  async getSections(payload, scope) {
    assertBranchAccess(scope, payload.branchId);
    return academicRepository.getSections(payload);
  },

  async createSection(payload, scope) {
    assertBranchAccess(scope, payload.branchId);
    assertCoordinatorWing(scope, payload.wing || payload.className);

    if (!SECTION_NAMES.includes(payload.name)) {
      throw new Error('Section must be A, B, C, or D.');
    }

    const id = await academicRepository.createSection(payload);
    return {id, ...payload, isActive: true};
  },

  async updateSection(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    const id = await academicRepository.updateSection(payload);
    return {id, ...payload};
  },

  async assignClassTeacher(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    const id = await academicRepository.assignClassTeacher(payload);
    return {id, ...payload};
  },

  async removeSection(sectionId) {
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.REMOVE_SECTION, {
      id: sectionId,
    });
    return {id: response.section_update, isActive: false};
  },
};

export default sectionService;
