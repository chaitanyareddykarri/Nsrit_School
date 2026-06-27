import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {logoutUser} from '../../store/slices/authSlice';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, shadows, spacing} from '../../theme';

const InfoRow = ({icon, title, description}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.textSoft} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoDesc}>{description || '—'}</Text>
    </View>
  </View>
);

const AccountantProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);

  const initials = (user?.fullName || 'AC')
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <Text style={styles.headerSubtitle}>Manage credentials & portal configurations</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.nameText}>{user?.fullName || 'Accountant'}</Text>
          <Text style={styles.roleText}>{ROLE_LABELS[role] || 'Accountant'}</Text>
        </View>

        <Text style={styles.sectionLabel}>Personal Information</Text>
        <View style={styles.infoGroup}>
          <InfoRow icon="phone-outline" title="Registered Phone" description={user?.phoneNumber} />
          <View style={styles.divider} />
          <InfoRow icon="shield-check-outline" title="Role" description={ROLE_LABELS[role] || role} />
          <View style={styles.divider} />
          <InfoRow icon="identifier" title="Employee ID" description={user?.employeeId} />
          <View style={styles.divider} />
          <InfoRow icon="office-building" title="Allocated Branch" description={user?.branchName || user?.branchId} />
        </View>

        <Text style={styles.sectionLabel}>System</Text>
        <View style={styles.infoGroup}>
          <InfoRow icon="application-outline" title="App Version" description="v1.0.0 (Release)" />
          <View style={styles.divider} />
          <InfoRow icon="database-outline" title="Database" description="Firebase Data Connect" />
          <View style={styles.divider} />
          <InfoRow icon="earth" title="Region" description="asia-south1 (Live)" />
        </View>

        <Pressable
          onPress={() => dispatch(logoutUser())}
          style={({pressed}) => [styles.logoutBtn, pressed && {opacity: 0.88}]}>
          <MaterialCommunityIcons name="logout" size={16} color={colors.danger} />
          <Text style={styles.logoutBtnText}>Sign Out of ERP</Text>
        </Pressable>

        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadows.clay,
  },
  backBtn: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  headerSubtitle: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  scroll: {flex: 1},
  scrollContent: {padding: spacing.lg, paddingBottom: spacing.xxl},

  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
    ...shadows.clay,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  avatarText: {color: colors.primary, fontSize: 26, fontWeight: '800'},
  nameText: {color: colors.text, fontSize: 18, fontWeight: '800'},
  roleText: {color: colors.textMuted, fontSize: 13, fontWeight: '600', marginTop: 2},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  infoGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.clay,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoCopy: {flex: 1},
  infoTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  infoDesc: {color: colors.textMuted, fontSize: 13, fontWeight: '500', marginTop: 2},
  divider: {backgroundColor: colors.background, height: 1, marginHorizontal: spacing.md},

  logoutBtn: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logoutBtnText: {color: colors.danger, fontSize: 14, fontWeight: '700'},
});

export default AccountantProfileScreen;
