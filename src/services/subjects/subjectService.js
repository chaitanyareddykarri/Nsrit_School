import {USER_ROLES} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

const canManageSubjects = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(String(role || '').toUpperCase());

const normalizeCode = value =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

const validateSubject = payload => {
  if (!payload.name?.trim()) {
    return 'Subject name is required.';
  }
  if (!payload.code?.trim()) {
    return 'Subject code is required.';
  }
  return '';
};

export const subjectService = {
  async getSubjects({limit = 100, offset = 0} = {}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_SUBJECTS, {
      limit,
      offset,
    });
    return response.subjects || [];
  },

  async createSubject(payload, scope) {
    if (!canManageSubjects(scope?.role)) {
      throw new Error('Only principals can manage subject masters.');
    }

    const normalized = {
      name: payload.name.trim(),
      code: normalizeCode(payload.code),
      status: payload.status || 'ACTIVE',
    };
    const error = validateSubject(normalized);
    if (error) {
      throw new Error(error);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_SUBJECT, normalized);
    return {id: response.subject_insert?.id || response.subject_insert, ...normalized};
  },

  async updateSubject(payload, scope) {
    if (!canManageSubjects(scope?.role)) {
      throw new Error('Only principals can manage subject masters.');
    }

    const normalized = {
      subjectId: payload.subjectId || payload.id,
      name: payload.name.trim(),
      code: normalizeCode(payload.code),
      status: payload.status || 'ACTIVE',
    };
    const error = validateSubject(normalized);
    if (error) {
      throw new Error(error);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_SUBJECT, normalized);
    return {id: response.subject_update?.id || response.subject_update, ...normalized};
  },
};

export default subjectService;
