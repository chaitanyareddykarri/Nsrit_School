import React, {useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SearchBar} from '../../components';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AUDIT_LOGS = [
  {
    id: 'l1',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹15,000 from Aarav Sharma (STU-2026-0043) for Tuition Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-09T17:30:00Z',
    receiptNo: 'REC-26-8941'},
  {
    id: 'l2',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹12,500 from Priya Patel (STU-2026-0102) for Admission Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-09T14:15:00Z',
    receiptNo: 'REC-26-8939'},
  {
    id: 'l3',
    action: 'RESULT_POSTED',
    title: 'Subject Term Marks Posted',
    description: 'Published Advanced Mathematics results for Grade XII-A to parent portal.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T16:00:00Z',
    details: '32 students posted successfully.'},
  {
    id: 'l4',
    action: 'NOTIFICATION_SENT',
    title: 'Notification Broadcast Dispatched',
    description: 'Sent message "Term II Fee Dues Reminder" to Parents Only.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T11:30:00Z',
    details: 'Delivered to 184 active parent app tokens.'},
  {
    id: 'l5',
    action: 'PAYMENT_RECORDED',
    title: 'Offline Cash Payment Recorded',
    description: 'Received ₹8,000 from Rohan Verma (STU-2026-0012) for Exam Fee.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-08T10:45:00Z',
    receiptNo: 'REC-26-8938'},
  {
    id: 'l6',
    action: 'USER_LOGIN',
    title: 'Portal Secure Authentication',
    description: 'Jane Doe logged into NSRIT Accounting Console from IP 192.168.1.45.',
    operator: 'System Auth',
    timestamp: '2026-06-09T09:00:00Z'},
  {
    id: 'l7',
    action: 'RESULT_POSTED',
    title: 'Subject Term Marks Posted',
    description: 'Published Business Studies results for Grade XI-B to parent portal.',
    operator: 'Jane Doe, CPA',
    timestamp: '2026-06-04T15:20:00Z',
    details: '34 students posted successfully.'},
];

const FILTER_OPTIONS = [
  {key: 'ALL', label: 'All'},
  {key: 'PAYMENTS', label: 'Payments'},
  {key: 'RESULTS', label: 'Results'},
  {key: 'ALERTS', label: 'Alerts'},
  {key: 'AUTH', label: 'Auth'},
];

const ACTION_META = {
  PAYMENT_RECORDED: {icon: 'cash-register', color: colors.success, bg: colors.successSoft},
  RESULT_POSTED: {icon: 'clipboard-check-outline', color: colors.purple, bg: colors.purpleSoft},
  NOTIFICATION_SENT: {icon: 'megaphone-outline', color: colors.warning, bg: colors.warningSoft},
  USER_LOGIN: {icon: 'shield-key-outline', color: colors.info, bg: colors.infoSoft}};

const formatLogTime = timestamp => {
  try {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true});
  } catch {
    return timestamp;
  }
};

const LogCard = ({item, index}) => {
  const meta = ACTION_META[item.action] || {
    icon: 'eye-outline',
    color: colors.textMuted,
    bg: colors.background};

  return (
    <Animated.View>
      <View style={[styles.card, {borderLeftColor: meta.color}]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconCircle, {backgroundColor: meta.bg}]}>
            <MaterialCommunityIcons name={meta.icon} size={17} color={meta.color} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.operatorText}>by {item.operator}</Text>
          </View>
          <Text style={styles.timeText}>{formatLogTime(item.timestamp)}</Text>
        </View>

        <Text style={styles.descText}>{item.description}</Text>

        {Boolean(item.receiptNo || item.details) ? (
          <View style={styles.metaRow}>
            {item.receiptNo ? (
              <View style={styles.receiptBadge}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={10}
                  color={colors.primary}
                />
                <Text style={styles.receiptText}>{item.receiptNo}</Text>
              </View>
            ) : null}
            {item.details ? (
              <Text style={styles.detailsText}>{item.details}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const AuditLogsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const getFilteredLogs = () =>
    AUDIT_LOGS.filter(log => {
      const matchesSearch =
        log.title.toLowerCase().includes(searchText.toLowerCase()) ||
        log.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.receiptNo &&
          log.receiptNo.toLowerCase().includes(searchText.toLowerCase()));

      let matchesFilter = true;
      if (selectedFilter === 'PAYMENTS') {matchesFilter = log.action === 'PAYMENT_RECORDED';}
      else if (selectedFilter === 'RESULTS') {matchesFilter = log.action === 'RESULT_POSTED';}
      else if (selectedFilter === 'ALERTS') {matchesFilter = log.action === 'NOTIFICATION_SENT';}
      else if (selectedFilter === 'AUTH') {matchesFilter = log.action === 'USER_LOGIN';}

      return matchesSearch && matchesFilter;
    });

  const filtered = getFilteredLogs();

  const paymentCount = AUDIT_LOGS.filter(l => l.action === 'PAYMENT_RECORDED').length;
  const alertCount = AUDIT_LOGS.filter(l => l.action === 'NOTIFICATION_SENT').length;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Audit & Compliance</Text>
              <Text style={styles.headerTitle}>System Audit Logs</Text>
              <Text style={styles.headerSub}>Finance & marks transaction journal</Text>
              <View style={styles.statRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statNum}>{AUDIT_LOGS.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statChip}>
                  <Text style={styles.statNum}>{paymentCount}</Text>
                  <Text style={styles.statLabel}>Payments</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statChip}>
                  <Text style={styles.statNum}>{alertCount}</Text>
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>
              </View>
            </Animated.View>

            {/* ── Search ── */}
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search logs, receipts, operators…"
            />

            {/* ── Filter chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}>
              {FILTER_OPTIONS.map(opt => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSelectedFilter(opt.key)}
                  style={[
                    styles.filterChip,
                    selectedFilter === opt.key && styles.filterChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === opt.key && styles.filterChipTextActive,
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {filtered.length > 0 ? (
              <Text style={styles.resultMeta}>
                {filtered.length} log{filtered.length !== 1 ? 's' : ''} found
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => <LogCard item={item} index={index} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="shield-search" size={44} color={colors.textSoft} />
            <Text style={styles.emptyTitle}>No logs match</Text>
            <Text style={styles.emptySub}>
              Try different search terms or change the filter.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Header
  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 2},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg},
  statChip: {gap: 2},
  statNum: {color: colors.white, fontSize: 18, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600'},
  statSep: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 28,
    width: 1},

  // Filters
  filterRow: {marginBottom: spacing.sm},
  filterContent: {gap: spacing.sm, paddingVertical: 2},
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs},
  filterChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterChipText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  filterChipTextActive: {color: colors.white},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  // Log card
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm},
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 34,
    justifyContent: 'center',
    width: 34},
  cardMeta: {flex: 1},
  cardTitle: {...typography.bodyBold, color: colors.text, fontSize: 13},
  operatorText: {color: colors.textSoft, fontSize: 10, fontWeight: '600', marginTop: 1},
  timeText: {color: colors.textMuted, fontSize: 10, fontWeight: '700'},
  descText: {color: colors.textMuted, fontSize: 12, lineHeight: 18},
  metaRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs},
  receiptBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  receiptText: {color: colors.primary, fontSize: 9, fontWeight: '800'},
  detailsText: {color: colors.textSoft, flex: 1, fontSize: 11, fontWeight: '600'},

  // Empty
  emptyWrap: {alignItems: 'center', padding: spacing.xl},
  emptyTitle: {...typography.bodyBold, color: colors.textMuted, marginTop: spacing.md},
  emptySub: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'center'}});

export default AuditLogsScreen;
