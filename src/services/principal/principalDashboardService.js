import academicRepository from '../../repositories/academicRepository';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {assertBranchAccess} from '../academics/academicAccess';

export const principalDashboardService = {
  async getDashboard(branchId, scope) {
    console.log(
      '[PrincipalDashboard] getDashboard — branchId:', branchId,
      '| userId:', scope?.userId,
      '| role:', scope?.role,
    );
    assertBranchAccess(scope, branchId);

    const [response, accountantsResp] = await Promise.all([
      academicRepository.getPrincipalDashboard(branchId),
      dataConnectClient
        .query(DATA_CONNECT_QUERIES.GET_ACCOUNTANTS, {branchId, limit: 100, offset: 0})
        .catch(err => {
          console.warn('[PrincipalDashboard] accountants fetch failed:', err.message);
          return {accountants: []};
        }),
    ]);

    const pendingPromotions = (response.pendingPromotions || []).filter(
      student => student.academicClass?.name !== '12',
    );

    const result = {
      totalStudents: response.students?.length || 0,
      totalTeachers: response.teachers?.length || 0,
      totalCoordinators: response.coordinators?.length || 0,
      totalSections: response.sections?.length || 0,
      totalAccountants: (accountantsResp.accountants || []).length,
      pendingPromotions: pendingPromotions.length,
    };

    console.log('[PrincipalDashboard] result:', JSON.stringify(result));
    return result;
  },
};

export default principalDashboardService;
