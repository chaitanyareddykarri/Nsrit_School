import React, {useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadows, spacing} from '../../theme';
import {logoutUser} from '../../store/slices/authSlice';

const InfoRow = ({icon, title, description}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.textSoft} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoDesc}>{description}</Text>
    </View>
  </View>
);

const AccountantProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const [offlineCache, setOfflineCache] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigation.replace('Login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AC';

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
          <Text style={styles.nameText}>{user?.fullName || 'Jane Doe, CPA'}</Text>
          <Text style={styles.roleText}>Lead Finance Officer / Auditor</Text>
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={14} color={colors.white} />
            <Text style={styles.verifiedBadgeText}>CPA Verified</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Personal Information</Text>
        <View style={styles.infoGroup}>
          <InfoRow icon="phone-outline" title="Registered Phone" description={user?.phoneNumber || '+91 99887 76655'} />
          <View style={styles.divider} />
          <InfoRow icon="account-tie-outline" title="Designation Role" description="Accountant (Role ID: ACC-99)" />
          <View style={styles.divider} />
          <InfoRow icon="office-building" title="Allocated Branch" description="NSRIT Central Campus" />
        </View>

        <Text style={styles.sectionLabel}>Credentials & Compliance</Text>
        <View style={styles.infoGroup}>
          <InfoRow icon="certificate-outline" title="License Code" description="CPA-IN-2026-89412" />
          <View style={styles.divider} />
          <InfoRow icon="draw" title="Signing Authority" description="Authorized (Level II Voucher Approver)" />
        </View>

        <Text style={styles.sectionLabel}>Portal Preferences</Text>
        <View style={styles.infoGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>Offline Ledger Cache</Text>
              <Text style={styles.switchDesc}>Keep fee registries available offline</Text>
            </View>
            <Switch
              value={offlineCache}
              onValueChange={setOfflineCache}
              trackColor={{false: colors.border, true: colors.secondarySoft}}
              thumbColor={offlineCache ? colors.secondary : colors.textSoft}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>Automatic Session Timeout</Text>
              <Text style={styles.switchDesc}>Log out after 15 minutes of idle state</Text>
            </View>
            <Switch
              value={sessionTimeout}
              onValueChange={setSessionTimeout}
              trackColor={{false: colors.border, true: colors.secondarySoft}}
              thumbColor={sessionTimeout ? colors.secondary : colors.textSoft}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>Biometric Verification</Text>
              <Text style={styles.switchDesc}>Verify fingerprints on payments upload</Text>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              trackColor={{false: colors.border, true: colors.secondarySoft}}
              thumbColor={biometricAuth ? colors.secondary : colors.textSoft}
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({pressed}) => [styles.logoutBtn, pressed && {opacity: 0.88}]}>
          <MaterialCommunityIcons name="logout" size={16} color={colors.danger} />
          <Text style={styles.logoutBtnText}>Sign Out of Account</Text>
        </Pressable>

        <Text style={styles.versionText}>System Portal Version 2.4.1 (Build 108)</Text>
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
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedBadgeText: {color: colors.white, fontSize: 11, fontWeight: '700'},

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

  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  switchCopy: {flex: 1, marginRight: spacing.md},
  switchTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  switchDesc: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},

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
  versionText: {color: colors.textSoft, fontSize: 10, fontWeight: '700', marginTop: spacing.xl, textAlign: 'center'},
});

export default AccountantProfileScreen;
