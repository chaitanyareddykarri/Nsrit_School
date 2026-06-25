import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const InfoRow = ({icon, label, value, color}) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIcon, {backgroundColor: `${color || colors.primary}15`}]}>
      <MaterialCommunityIcons name={icon} size={18} color={color || colors.primary} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const AcademicYearOverviewScreen = ({navigation}) => {
  const activeYear = useSelector(state => state.auth.activeAcademicYear);
  const user = useSelector(state => state.auth.user);

  const formatDate = iso => {
    if (!iso) {return 'Not set';}
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const statusColor = status => {
    if (!status) {return colors.textMuted;}
    const s = String(status).toUpperCase();
    if (s === 'ACTIVE') {return colors.success;}
    if (s === 'PLANNING') {return colors.warning;}
    if (s === 'CLOSED') {return colors.danger;}
    return colors.textMuted;
  };

  return (
    <View style={styles.root}>
      {/* Header banner */}
      <View style={styles.banner}>
        <MaterialCommunityIcons name="calendar-star-outline" size={32} color={colors.white} />
        <Text style={styles.bannerTitle}>
          {activeYear?.name || `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: `${statusColor(activeYear?.status)}25`}]}>
          <View style={[styles.statusDot, {backgroundColor: statusColor(activeYear?.status)}]} />
          <Text style={[styles.statusText, {color: statusColor(activeYear?.status)}]}>
            {activeYear?.status || 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <InfoRow
          icon="calendar-start"
          label="Start Date"
          value={formatDate(activeYear?.startDate)}
          color={colors.success}
        />
        <View style={styles.div} />
        <InfoRow
          icon="calendar-end"
          label="End Date"
          value={formatDate(activeYear?.endDate)}
          color={colors.danger}
        />
        <View style={styles.div} />
        <InfoRow
          icon="numeric"
          label="Academic Year Number"
          value={activeYear?.startYear ? String(activeYear.startYear) : '—'}
          color={colors.info}
        />
      </View>

      {/* Links */}
      <View style={styles.card}>
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('AcademicStructure')}>
          <MaterialCommunityIcons name="shape-outline" size={20} color={colors.secondary} />
          <Text style={styles.linkText}>Academic Structure</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.div} />
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('PromotionManagement')}>
          <MaterialCommunityIcons name="school-outline" size={20} color={colors.warning} />
          <Text style={styles.linkText}>Promotion Management</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      {!activeYear && (
        <View style={styles.notice}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.warning} />
          <Text style={styles.noticeText}>
            No active academic year configured. Contact Main Admin to set up the current year.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background, padding: spacing.page},
  banner: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
    ...shadows.clay,
  },
  bannerTitle: {color: colors.white, fontSize: 28, fontWeight: '900'},
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  statusDot: {borderRadius: radius.pill, height: 7, width: 7},
  statusText: {fontSize: 12, fontWeight: '700'},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoCopy: {flex: 1},
  infoLabel: {...typography.caption, color: colors.textMuted},
  infoValue: {...typography.bodyBold, color: colors.text, marginTop: 2},
  div: {backgroundColor: colors.borderLight, height: 1, marginLeft: 72},
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkText: {...typography.bodyBold, color: colors.text, flex: 1},
  notice: {
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning}12`,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {...typography.caption, color: colors.warning, flex: 1},
});

export default AcademicYearOverviewScreen;
