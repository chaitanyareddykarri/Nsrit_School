import {expect, it} from '@jest/globals';
import {ROLE_LABELS, USER_ROLES} from '../src/config/constants';

it('defines all supported NSRIT Connect roles', () => {
  expect(Object.keys(USER_ROLES)).toEqual([
    'MAIN_ADMIN',
    'BRANCH_ADMIN',
    'PRINCIPAL',
    'COORDINATOR',
    'TEACHER',
    'CLASS_TEACHER',
    'PARENT',
    'ACCOUNTANT',
    'FRONT_DESK',
  ]);

  expect(ROLE_LABELS[USER_ROLES.TEACHER]).toBe('Teacher');
  expect(ROLE_LABELS[USER_ROLES.CLASS_TEACHER]).toBe('Class Teacher');
  expect(ROLE_LABELS[USER_ROLES.ACCOUNTANT]).toBe('Accountant');
});
