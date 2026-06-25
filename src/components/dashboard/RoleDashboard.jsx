import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ATTENDANCE_STATUS, ROLE_LABELS} from '../../config/constants';
import useFeeAccess from '../../hooks/useFeeAccess';
import {logoutUser} from '../../store/slices/authSlice';
import {fetchAttendance} from '../../store/slices/attendanceSlice';
import {fetchFees} from '../../store/slices/feeSlice';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import ScreenContainer from '../common/ScreenContainer';
import SectionHeader from '../common/SectionHeader';
import AttendanceCard from './AttendanceCard';
import DashboardHeader from './DashboardHeader';
import StatCard from './StatCard';
import SummaryCard from './SummaryCard';

const RoleDashboard = ({
  role,
  navigation,
  subtitle,
  primaryActions = [],
  stats = [],
}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const feeSummary = useSelector(state => state.fees.summary);
  const attendance = useSelector(state => state.attendance.items);
  const access = useFeeAccess();

  useEffect(() => {
    dispatch(fetchFees(access));
    dispatch(fetchAttendance({}));
  }, [access, dispatch]);

  const present =
    attendance[0]?.records?.filter(item => item.status === 'present').length ||
    attendance[0]?.records?.filter(item => item.status === ATTENDANCE_STATUS.PRESENT).length ||
    0;
  const absent =
    attendance[0]?.records?.filter(item => item.status === 'absent').length ||
    attendance[0]?.records?.filter(item => item.status === ATTENDANCE_STATUS.ABSENT).length ||
    0;

  return (
    <ScreenContainer>
      <DashboardHeader
        name={user?.name}
        role={role}
        subtitle={subtitle || ROLE_LABELS[role]}
        onLogout={() => dispatch(logoutUser())}
      />

      <SectionHeader
        title="Priority Actions"
        subtitle="Most-used workflows for this role"
      />
      <View style={styles.grid}>
        {primaryActions.map(action => (
          <StatCard
            key={action.title}
            title={action.title}
            value={action.value}
            icon={action.icon}
            tone={action.tone}
            onPress={() => navigation.navigate(action.route)}
          />
        ))}
      </View>

      <SectionHeader
        title="Operational Snapshot"
        subtitle="Attendance, fee, and role-specific metrics"
      />
      <View style={styles.grid}>
        <StatCard
          title="Attendance"
          value={`${present}/${present + absent}`}
          icon="account-check"
          tone={colors.success}
        />
        <StatCard
          title="Fee Due"
          value={formatCurrency(feeSummary.dueAmount)}
          icon="cash-clock"
          tone={colors.danger}
          onPress={() => navigation.navigate('FeeDashboard')}
        />
        {stats.map(item => (
          <StatCard key={item.title} {...item} />
        ))}
      </View>

      <SectionHeader
        title="Today's Attendance"
        subtitle="Live operational snapshot"
      />
      <AttendanceCard
        title="Today"
        date="Today"
        present={present}
        absent={absent}
        late={0}
        status={ATTENDANCE_STATUS.PRESENT}
      />

      <SectionHeader
        title="Fee Summary"
        subtitle="Collection health and pending balances"
      />
      <SummaryCard
        title="Overall Collection"
        value={formatCurrency(feeSummary.paidAmount)}
        subtitle={`${formatCurrency(feeSummary.dueAmount)} pending`}
        progress={feeSummary.collectionRate}
        tone={colors.primary}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
});

export default RoleDashboard;
