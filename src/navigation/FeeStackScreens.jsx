import React from 'react';
import ClassFeeManagementScreen from '../screens/fees/ClassFeeManagementScreen';
import ClassWiseFeeReportScreen from '../screens/fees/ClassWiseFeeReportScreen';
import CreateFeePlanScreen from '../screens/fees/CreateFeePlanScreen';
import DueStudentsScreen from '../screens/fees/DueStudentsScreen';
import FeeCategoryManagementScreen from '../screens/fees/FeeCategoryManagementScreen';
import FeeCollectionScreen from '../screens/fees/FeeCollectionScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import FeeLedgerScreen from '../screens/fees/FeeLedgerScreen';
import FeePlanManagementScreen from '../screens/fees/FeePlanManagementScreen';
import FeeReportsScreen from '../screens/fees/FeeReportsScreen';
import PaidStudentsScreen from '../screens/fees/PaidStudentsScreen';
import PaymentHistoryScreen from '../screens/fees/PaymentHistoryScreen';
import StudentFeeDetailsScreen from '../screens/fees/StudentFeeDetailsScreen';
import StudentFeeProfileScreen from '../screens/fees/StudentFeeProfileScreen';
import UploadOfflinePaymentScreen from '../screens/fees/UploadOfflinePaymentScreen';

// headerShown: true on every screen here so that safe area is handled by the
// React Navigation header regardless of whether the parent navigator has
// headerShown: false as its global default (e.g. AccountantNavigator, MainAdminNavigator).
export const renderFeeStackScreens = (Stack, options = {}) => (
  <>
    {!options.skipDashboard ? (
      <Stack.Screen
        name="FeeDashboard"
        component={FeeDashboardScreen}
        options={{headerShown: true, title: 'Fees'}}
      />
    ) : null}
    <Stack.Screen
      name="StudentFeeDetails"
      component={StudentFeeDetailsScreen}
      options={{headerShown: true, title: 'Student Fee'}}
    />
    <Stack.Screen
      name="StudentFeeProfile"
      component={StudentFeeProfileScreen}
      options={{headerShown: true, title: 'Student Fee Profile'}}
    />
    <Stack.Screen
      name="FeePlanManagement"
      component={FeePlanManagementScreen}
      options={{headerShown: true, title: 'Fee Plans'}}
    />
    <Stack.Screen
      name="ClassFeeManagement"
      component={ClassFeeManagementScreen}
      options={{headerShown: true, title: 'Class Fees'}}
    />
    <Stack.Screen
      name="CreateFeePlan"
      component={CreateFeePlanScreen}
      options={{headerShown: true, title: 'Create Fee Plan'}}
    />
    <Stack.Screen
      name="FeeCollection"
      component={FeeCollectionScreen}
      options={{headerShown: true, title: 'Fee Collection'}}
    />
    <Stack.Screen
      name="FeeCategoryManagement"
      component={FeeCategoryManagementScreen}
      options={{headerShown: true, title: 'Fee Categories'}}
    />
    <Stack.Screen
      name="PaymentHistory"
      component={PaymentHistoryScreen}
      options={{headerShown: true, title: 'Payments'}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{headerShown: true, title: 'Ledger'}}
    />
    <Stack.Screen
      name="DueStudents"
      component={DueStudentsScreen}
      options={{headerShown: true, title: 'Due Students'}}
    />
    <Stack.Screen
      name="PaidStudents"
      component={PaidStudentsScreen}
      options={{headerShown: true, title: 'Paid Students'}}
    />
    {options.canUpload ? (
      <Stack.Screen
        name="UploadOfflinePayment"
        component={UploadOfflinePaymentScreen}
        options={{headerShown: true, title: 'Upload Payment'}}
      />
    ) : null}
    {options.reports ? (
      <>
        <Stack.Screen
          name="ClassWiseFeeReport"
          component={ClassWiseFeeReportScreen}
          options={{headerShown: true, title: 'Class-wise Report'}}
        />
        <Stack.Screen
          name="FeeReports"
          component={FeeReportsScreen}
          options={{headerShown: true, title: 'Fee Reports'}}
        />
      </>
    ) : null}
  </>
);
