import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {buildStudentIdPayload} from '../../utils/studentIdGenerator';

export const AdmissionNumberService = {
  async getNextAdmissionNumber({year, branchCode}) {
    if (!year || !branchCode) {
      throw new Error('Admission year and branch code are required to generate admission number.');
    }

    const normalizedBranchCode = buildStudentIdPayload({
      admissionYear: year,
      branchCode,
      lastSerialNumber: 0,
    }).branchCode;
    const lastStudentResponse = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_LAST_STUDENT_SERIAL,
      {
        admissionYear: Number(year),
        branchCode: normalizedBranchCode,
      },
    );
    const lastStudent = lastStudentResponse.students?.[0];
    const lastSerialNumber = Number(lastStudent?.serialNumber || 0);

    console.log('[StudentCreate] Admission sequence resolved:', {
      year: Number(year),
      branchCode: normalizedBranchCode,
      lastStudentSerial: lastStudent?.serialNumber || 0,
      nextSerialNumber: lastSerialNumber + 1,
    });

    return buildStudentIdPayload({
      admissionYear: Number(year),
      branchCode: normalizedBranchCode,
      lastSerialNumber,
    });
  },
};

export default AdmissionNumberService;
