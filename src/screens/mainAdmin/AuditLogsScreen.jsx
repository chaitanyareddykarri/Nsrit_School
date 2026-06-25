import React, {useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const PAGE_SIZE = 50;

const LOG_TYPE_COLORS = {
  CREATE: colors.success,
  UPDATE: colors.primary,
  DELETE: colors.danger,
  LOGIN: colors.secondary,
  LOGOUT: colors.warning};

const getLogColor = action => {
  const key = Object.keys(LOG_TYPE_COLORS).find(k => String(action).toUpperCase().startsWith(k));
  return key ? LOG_TYPE_COLORS[key] : colors.textMuted;
};

const LogCard = ({item, index}) => {
  const color = getLogColor(item.action);
  return (
    <Animated.View>
      <View style={[styles.logCard, {borderLeftColor: color}]}>
        <View style={styles.logHeader}>
          <View style={[styles.logDot, {backgroundColor: color}]} />
          <Text style={styles.logAction} numberOfLines={1}>{item.action}</Text>
          <Text style={styles.logTime}>{item.createdAt}</Text>
        </View>
        <View style={styles.logBody}>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>By</Text>
            <Text style={styles.logValue}>{item.performedBy || '—'}</Text>
          </View>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>Role</Text>
            <Text style={styles.logValue}>{item.actingAs || item.performedRole || '—'}</Text>
          </View>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>Branch</Text>
            <Text style={styles.logValue}>{item.branchId || 'Global'}</Text>
          </View>
          {item.entityType ? (
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>Entity</Text>
              <Text style={styles.logValue}>{item.entityType} {item.entityId || ''}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const AuditLogsScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const [offset, setOffset] = useState(0);
  const branchId = route?.params?.branchId || user?.mainAdminBranchContext?.branchId || null;
  const logsQuery = useQuery({
    queryKey: ['auditLogs', branchId, offset],
    queryFn: () => mainAdminService.getAuditLogs({branchId, limit: PAGE_SIZE, offset})});

  const logs = logsQuery.data || [];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View style={styles.hero}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>Main Admin</Text>
            <Text style={styles.heroTitle}>Audit Logs</Text>
            <Text style={styles.heroSub}>
              {branchId ? 'Actions in selected branch' : 'Actions across all branches'}
            </Text>
          </Animated.View>
        }
        renderItem={({item, index}) => <LogCard item={item} index={index} />}
        ListEmptyComponent={
          logsQuery.error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{logsQuery.error.message}</Text>
            </View>
          ) : (
            <EmptyState title="No audit logs" message="Main Admin actions will appear here." />
          )
        }
        ListFooterComponent={
          logs.length > 0 ? (
            <View style={styles.pagination}>
              <Pressable
                onPress={() => setOffset(current => Math.max(0, current - PAGE_SIZE))}
                disabled={offset === 0}
                style={[styles.pageBtn, offset === 0 && styles.pageBtnDisabled]}>
                <MaterialCommunityIcons name="chevron-left" size={16} color={offset === 0 ? colors.textMuted : colors.primary} />
                <Text style={[styles.pageBtnText, offset === 0 && {color: colors.textMuted}]}>Previous</Text>
              </Pressable>
              <Text style={styles.pageInfo}>Page {Math.floor(offset / PAGE_SIZE) + 1}</Text>
              <Pressable
                onPress={() => setOffset(current => current + PAGE_SIZE)}
                disabled={logs.length < PAGE_SIZE}
                style={[styles.pageBtn, logs.length < PAGE_SIZE && styles.pageBtnDisabled]}>
                <Text style={[styles.pageBtnText, logs.length < PAGE_SIZE && {color: colors.textMuted}]}>Next</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={logs.length < PAGE_SIZE ? colors.textMuted : colors.primary} />
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  logCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  logHeader: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm},
  logDot: {borderRadius: radius.pill, height: 6, width: 6},
  logAction: {...typography.bodyBold, color: colors.text, flex: 1, fontSize: 12},
  logTime: {color: colors.textMuted, fontSize: 10, fontWeight: '500'},
  logBody: {gap: 3},
  logRow: {flexDirection: 'row', gap: spacing.sm},
  logLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', width: 50},
  logValue: {color: colors.text, flex: 1, fontSize: 11, fontWeight: '500'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingVertical: spacing.sm},
  pageBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  pageBtnDisabled: {opacity: 0.4},
  pageBtnText: {color: colors.primary, fontSize: 13, fontWeight: '700'},
  pageInfo: {color: colors.textMuted, fontSize: 11, fontWeight: '600'}});

export default AuditLogsScreen;
