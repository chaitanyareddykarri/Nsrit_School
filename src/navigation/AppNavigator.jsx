import React, {useEffect} from 'react';
import {AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {USER_ROLES} from '../config/constants';
import SplashScreen from '../screens/auth/SplashScreen';
import {bootstrapAuth, loadActiveAcademicYear, validateSession} from '../store/slices/authSlice';
import AccountantNavigator from './AccountantNavigator';
import AuthNavigator from './AuthNavigator';
import BranchAdminNavigator from './BranchAdminNavigator';
import CoordinatorNavigator from './CoordinatorNavigator';
import MainAdminNavigator from './MainAdminNavigator';
import ParentNavigator from './ParentNavigator';
import PrincipalNavigator from './PrincipalNavigator';
import TeacherNavigator from './TeacherNavigator';
import {ensureMasterClassesForBranch} from '../services/academics/SeedMasterClasses';

const getRoleNavigator = role => {
  switch (String(role || '').toUpperCase()) {
    case USER_ROLES.MAIN_ADMIN:
      return <MainAdminNavigator />;
    case USER_ROLES.BRANCH_ADMIN:
      return <BranchAdminNavigator />;
    case USER_ROLES.PRINCIPAL:
      return <PrincipalNavigator />;
    case USER_ROLES.COORDINATOR:
      return <CoordinatorNavigator />;
    case USER_ROLES.TEACHER:
    case USER_ROLES.CLASS_TEACHER:
      return <TeacherNavigator />;
    case USER_ROLES.PARENT:
      return <ParentNavigator />;
    case USER_ROLES.ACCOUNTANT:
      return <AccountantNavigator />;

    default:
      return <AuthNavigator />;
  }
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const {isBootstrapping, isAuthenticated, isSelectingRole, role, user} = useSelector(
    state => state.auth,
  );

  console.log('AppNavigator render state:', {isBootstrapping, isAuthenticated, isSelectingRole, role});

  useEffect(() => {
    const canSeedClasses = ['PRINCIPAL', 'BRANCH_ADMIN', 'MAIN_ADMIN'].includes(
      String(role || '').toUpperCase(),
    );
    if (isAuthenticated && user?.branchId && canSeedClasses) {
      ensureMasterClassesForBranch({branchId: user.branchId}).catch(error => {
        console.log('Master class seed skipped:', error.message);
      });
    }
    if (isAuthenticated && user?.branchId) {
      dispatch(loadActiveAcademicYear(user.branchId));
    }
  }, [isAuthenticated, role, user?.branchId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        dispatch(validateSession());
      }
    });
    return () => subscription.remove();
  }, [dispatch]);

  const renderContent = () => {
    if (isBootstrapping) {
      console.log('AppNavigator: rendering SplashScreen');
      return (
        <SplashScreen onFinish={() => {
          console.log('AppNavigator: SplashScreen finished, bootstrapping auth...');
          dispatch(bootstrapAuth());
        }} />
      );
    }
    if (isAuthenticated) {
      console.log('AppNavigator: rendering RoleNavigator for role:', role);
      return getRoleNavigator(role);
    }
    console.log('AppNavigator: rendering AuthNavigator');
    return <AuthNavigator />;
  };

  return (
    <NavigationContainer onReady={() => console.log('NavigationContainer: Ready')}>
      {renderContent()}
    </NavigationContainer>
  );
};

export default AppNavigator;
