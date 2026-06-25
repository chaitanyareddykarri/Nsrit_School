import React from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {APP_NAME} from '../../config/constants';
import {colors, radius, shadows, spacing} from '../../theme';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

const SectionLabel = ({title}) => (
  <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
);

const SettingRow = ({icon, iconColor = colors.primary, label, desc, badge, onPress, danger}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.row, pressed && {opacity: 0.75}]}>
    <View style={[styles.rowIcon, {backgroundColor: `${danger ? colors.danger : iconColor}12`}]}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={danger ? colors.danger : iconColor}
      />
    </View>
    <View style={styles.rowCopy}>
      <Text style={[styles.rowLabel, danger && {color: colors.danger}]}>{label}</Text>
      {desc ? <Text style={styles.rowDesc}>{desc}</Text> : null}
    </View>
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    ) : (
      <MaterialCommunityIcons name="chevron-right" size={15} color={colors.border} />
    )}
  </Pressable>
);

const Divider = () => <View style={styles.divider} />;

const SettingsScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="cog-outline" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>Settings</Text>
        <Text style={styles.heroSub}>System configuration and administration</Text>
      </Animated.View>

      {/* Admin Info Card */}
      <Animated.View style={styles.infoCard}>
        <View style={styles.infoAvatar}>
          <Text style={styles.infoAvatarText}>
            {(user?.fullName || 'MA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoName}>{user?.fullName || 'Main Administrator'}</Text>
          <Text style={styles.infoRole}>Main Administrator • {APP_NAME}</Text>
        </View>
      </Animated.View>

      {/* System Management */}
      <Animated.View style={styles.group}>
        <SectionLabel title="System Management" />
        <SettingRow
          icon="office-building-outline"
          iconColor={colors.primaryDark}
          label="Manage Branches"
          desc="Add, edit or deactivate school branches"
          onPress={() => navigation.navigate('ManageBranches')}
        />
        <Divider />
        <SettingRow
          icon="account-group-outline"
          iconColor={colors.secondary}
          label="Manage Users"
          desc="Create and assign role-based user accounts"
          onPress={() => navigation.navigate('ManageUsers')}
        />
        <Divider />
        <SettingRow
          icon="chart-box-outline"
          iconColor={colors.info}
          label="Revenue Overview"
          desc="Fee collection and financial summary"
          onPress={() => navigation.navigate('RevenueOverview')}
        />
        <Divider />
        <SettingRow
          icon="text-box-search-outline"
          iconColor={colors.warning}
          label="Audit Logs"
          desc="Track system changes and admin actions"
          onPress={() => navigation.navigate('AuditLogs')}
        />
      </Animated.View>

      {/* Academic Configuration */}
      <Animated.View style={styles.group}>
        <SectionLabel title="Academic Configuration" />
        <SettingRow
          icon="google-classroom"
          iconColor={colors.primary}
          label="Classes & Wings"
          desc="Global academic class structure"
          onPress={() => navigation.navigate('GlobalClasses')}
        />
        <Divider />
        <SettingRow
          icon="account-school-outline"
          iconColor={colors.secondary}
          label="Student Records"
          desc="View and manage all students globally"
          onPress={() => navigation.navigate('GlobalStudents')}
        />
        <Divider />
        <SettingRow
          icon="chart-line"
          iconColor={colors.info}
          label="Global Reports"
          desc="Cross-branch analytics and reports"
          onPress={() => navigation.navigate('GlobalReports')}
        />
      </Animated.View>

      {/* App */}
      <Animated.View style={styles.group}>
        <SectionLabel title="Application" />
        <SettingRow
          icon="information-outline"
          iconColor={colors.textMuted}
          label="About"
          desc={`${APP_NAME} • Version ${APP_VERSION} (${BUILD_NUMBER})`}
          badge="v1.0"
        />
        <Divider />
        <SettingRow
          icon="shield-lock-outline"
          iconColor={colors.textMuted}
          label="Privacy Policy"
          desc="Data handling and privacy practices"
          onPress={() => Linking.openURL('https://nsrit.edu.in/privacy').catch(() => {})}
        />
        <Divider />
        <SettingRow
          icon="help-circle-outline"
          iconColor={colors.textMuted}
          label="Support"
          desc="Contact technical support team"
          onPress={() => Linking.openURL('mailto:support@nsrit.edu.in').catch(() => {})}
        />
      </Animated.View>

    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 80},

  hero: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xxl,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    height: 160,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 68,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 68},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500', marginTop: 4},

  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadows.clay},
  infoAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  infoAvatarText: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  infoCopy: {flex: 1},
  infoName: {color: colors.text, fontSize: 14, fontWeight: '800'},
  infoRole: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},

  group: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.clay},
  sectionLabel: {
    color: colors.textSoft,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs},
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13},
  rowIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36},
  rowCopy: {flex: 1},
  rowLabel: {color: colors.text, fontSize: 14, fontWeight: '700'},
  rowDesc: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 1},
  divider: {backgroundColor: colors.background, height: 1, marginLeft: spacing.lg + 36 + spacing.md},
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2},
  badgeText: {color: colors.primary, fontSize: 9, fontWeight: '800'}});

export default SettingsScreen;
