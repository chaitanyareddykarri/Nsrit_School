import {parentService} from '../src/services/parents/parentService';
import dataConnectClient from '../src/services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../src/services/dataconnect/operations';

jest.mock('../src/services/dataconnect/dataConnectClient', () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn(),
      mutate: jest.fn(),
    },
    dataConnectClient: {
      query: jest.fn(),
      mutate: jest.fn(),
    },
  };
});

describe('parentService.createParent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    branchId: 'branch-1',
    phoneNumber: '9876543210',
    fullName: 'Father Name',
    fatherName: 'Father Name',
    motherName: 'Mother Name',
    address: '123 Main St',
  };

  it('throws error if branchId or phoneNumber is missing', async () => {
    await expect(parentService.createParent({ phoneNumber: '9876543210' })).rejects.toThrow(
      'Parent branch and phone number are required.'
    );
  });

  it('handles existing parent profile with linked user: adds PARENT role if needed and returns parent', async () => {
    // 1. Mock existing parent profile with userId
    dataConnectClient.query.mockImplementation((query, vars) => {
      if (query === DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE) {
        return Promise.resolve({ parents: [{ id: 'parent-1', userId: 'user-1', phoneNumber: '9876543210' }] });
      }
      if (query === DATA_CONNECT_QUERIES.GET_USER_BY_PHONE) {
        return Promise.resolve({ users: [{ id: 'user-1', phoneNumber: '9876543210', role: 'TEACHER', roles: ['TEACHER'] }] });
      }
      return Promise.resolve({});
    });

    dataConnectClient.mutate.mockResolvedValue({});

    const result = await parentService.createParent(payload);

    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.ADD_PARENT_ROLE, {
      userId: 'user-1',
      branchId: 'branch-1',
    });
    expect(result).toEqual({ id: 'parent-1', userId: 'user-1', phoneNumber: '9876543210' });
  });

  it('handles existing parent profile without user, but user exists by phone: links user and adds PARENT role', async () => {
    // 1. Mock existing parent profile without userId
    dataConnectClient.query.mockImplementation((query, vars) => {
      if (query === DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE) {
        return Promise.resolve({ parents: [{ id: 'parent-1', userId: null, phoneNumber: '9876543210' }] });
      }
      if (query === DATA_CONNECT_QUERIES.GET_USER_BY_PHONE) {
        return Promise.resolve({ users: [{ id: 'user-teacher-1', phoneNumber: '9876543210', role: 'TEACHER', roles: ['TEACHER'] }] });
      }
      return Promise.resolve({});
    });

    dataConnectClient.mutate.mockResolvedValue({});

    const result = await parentService.createParent(payload);

    // Should call add parent role
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.ADD_PARENT_ROLE, {
      userId: 'user-teacher-1',
      branchId: 'branch-1',
    });
    // Should link existing parent profile to existing user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.LINK_PARENT_USER, {
      parentId: 'parent-1',
      userId: 'user-teacher-1',
    });
    expect(result).toEqual({ id: 'parent-1', userId: 'user-teacher-1', phoneNumber: '9876543210' });
  });

  it('handles existing parent profile without user, and no user exists by phone: creates user, links, and adds role', async () => {
    // 1. Mock existing parent profile without userId and no user
    dataConnectClient.query.mockImplementation((query, vars) => {
      if (query === DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE) {
        return Promise.resolve({ parents: [{ id: 'parent-1', userId: null, phoneNumber: '9876543210' }] });
      }
      if (query === DATA_CONNECT_QUERIES.GET_USER_BY_PHONE) {
        return Promise.resolve({ users: [] });
      }
      return Promise.resolve({});
    });

    dataConnectClient.mutate.mockImplementation((mutation, vars) => {
      if (mutation === DATA_CONNECT_MUTATIONS.CREATE_USER) {
        return Promise.resolve({ user_insert: { id: 'new-user-1' } });
      }
      return Promise.resolve({});
    });

    const result = await parentService.createParent(payload);

    // Should create user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.CREATE_USER, expect.any(Object));
    // Should add parent role to new user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.ADD_PARENT_ROLE, {
      userId: 'new-user-1',
      branchId: 'branch-1',
    });
    // Should link existing parent to new user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.LINK_PARENT_USER, {
      parentId: 'parent-1',
      userId: 'new-user-1',
    });
    expect(result).toEqual({ id: 'parent-1', userId: 'new-user-1', phoneNumber: '9876543210' });
  });

  it('handles new parent profile, existing user without PARENT role: adds PARENT role to user and creates parent', async () => {
    // 1. Mock no parent profile, but user exists (e.g. Teacher)
    dataConnectClient.query.mockImplementation((query, vars) => {
      if (query === DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE) {
        return Promise.resolve({ parents: [] });
      }
      if (query === DATA_CONNECT_QUERIES.GET_USER_BY_PHONE) {
        return Promise.resolve({ users: [{ id: 'user-teacher-1', phoneNumber: '9876543210', role: 'TEACHER', roles: ['TEACHER'] }] });
      }
      return Promise.resolve({});
    });

    dataConnectClient.mutate.mockImplementation((mutation, vars) => {
      if (mutation === DATA_CONNECT_MUTATIONS.CREATE_PARENT) {
        return Promise.resolve({ parent_insert: { id: 'new-parent-1' } });
      }
      return Promise.resolve({});
    });

    const result = await parentService.createParent(payload);

    // Should add PARENT role to user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.ADD_PARENT_ROLE, {
      userId: 'user-teacher-1',
      branchId: 'branch-1',
    });
    // Should create parent linked to existing user
    expect(dataConnectClient.mutate).toHaveBeenCalledWith(DATA_CONNECT_MUTATIONS.CREATE_PARENT, {
      branchId: 'branch-1',
      fullName: 'Father Name',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      countryCode: '+91',
      phoneNumber: '9876543210',
      address: '123 Main St',
      userId: 'user-teacher-1',
    });
    expect(result).toEqual({
      id: 'new-parent-1',
      userId: 'user-teacher-1',
      branchId: 'branch-1',
      fullName: 'Father Name',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      countryCode: '+91',
      phoneNumber: '9876543210',
      address: '123 Main St',
      isActive: true,
    });
  });
});
