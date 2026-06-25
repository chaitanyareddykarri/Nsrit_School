import dataConnectClient from '../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../services/dataconnect/operations';

export const studentRepository = {
  async getStudentsByWing({branchId, wing, limit = 50, offset = 0}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_STUDENTS_BY_WING, {
      branchId,
      wing,
      limit,
      offset,
    });
    return response.students || [];
  },

  async transferStudent(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.TRANSFER_STUDENT,
      payload,
    );
    return response.student_update;
  },

  async bulkAssignStudents(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.BULK_ASSIGN_STUDENTS,
      payload,
    );
    return response.student_updateMany;
  },

  async updateStudentStatus(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.UPDATE_STUDENT_STATUS,
      payload,
    );
    return response.student_update;
  },

  async promoteStudents(payload) {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.PROMOTE_STUDENTS,
      payload,
    );

    await Promise.all(
      payload.studentIds.map(studentId =>
        dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.RECORD_PROMOTION, {
          studentId,
          fromClassId: payload.fromClassId,
          toClassId: payload.toClassId,
          fromSectionId: payload.fromSectionId,
          toSectionId: payload.toSectionId,
          promotedById: payload.promotedById,
        }),
      ),
    );

    return response.student_updateMany;
  },
};

export default studentRepository;
