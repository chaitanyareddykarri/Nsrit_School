import React from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const columns = [
  'Branch', 'Students', 'Teachers', 'Coordinators', 'Accountants',
  'Attendance', 'Collected', 'Pending', 'Concessions', 'Admissions',
];

const buildRows = rows =>
  rows.map(row => [
    `${row.branchName} (${row.branchCode})`,
    row.students, row.teachers, row.coordinators, row.accountants,
    `${row.attendancePercent}%`, row.paidFees, row.pendingFees, row.concessionFees, row.admissions,
  ]);

const MetricPill = ({label, value}) => (
  <View style={styles.metricPill}>
    <Text style={styles.metricValue}>{value ?? 0}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const GlobalReportsScreen = () => {
  const reportsQuery = useQuery({
    queryKey: ['globalReports'],
    queryFn: () => mainAdminService.getGlobalReports({forceRefresh: true})});

  const shareReport = async (format = 'csv') => {
    try {
      const rows = reportsQuery.data?.branchWise || [];
      const dataRows = buildRows(rows);
      const ws = XLSX.utils.aoa_to_sheet([columns, ...dataRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Global Reports');
      const bookType = format === 'csv' ? 'csv' : 'xlsx';
      const wbout = XLSX.write(wb, {type: 'base64', bookType});
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const mimeType =
        format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filePath = `${RNFS.CachesDirectoryPath}/GlobalReports.${ext}`;
      await RNFS.writeFile(filePath, wbout, 'base64');
      await Share.open({
        title: 'Global Reports',
        url: `file://${filePath}`,
        type: mimeType,
        failOnCancel: false});
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (reportsQuery.isLoading && !reportsQuery.data) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <Text style={styles.loadingText}>Loading reports…</Text>
      </View>
    );
  }

  if (reportsQuery.error) {
    return (
      <View style={styles.root}>
        <EmptyState title="Unable to load reports" message={reportsQuery.error.message} />
      </View>
    );
  }

  const {totals = {}, branchWise = []} = reportsQuery.data || {};

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Main Admin</Text>
        <Text style={styles.heroTitle}>Global Reports</Text>
        <Text style={styles.heroSub}>All-branch strength, attendance & fee snapshot</Text>
        <View style={styles.exportRow}>
          <Pressable
            onPress={() => shareReport('csv')}
            style={({pressed}) => [styles.exportBtn, pressed && {opacity: 0.85}]}>
            <MaterialCommunityIcons name="file-delimited-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </Pressable>
          <Pressable
            onPress={() => shareReport('xlsx')}
            style={({pressed}) => [styles.exportBtn, pressed && {opacity: 0.85}]}>
            <MaterialCommunityIcons name="microsoft-excel" size={14} color={colors.primaryDark} />
            <Text style={styles.exportBtnText}>Export Excel</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Metrics grid ── */}
      <Animated.View style={styles.metricsGrid}>
        {[
          {label: 'Students', value: totals.students},
          {label: 'Teachers', value: totals.teachers},
          {label: 'Coordinators', value: totals.coordinators},
          {label: 'Accountants', value: totals.accountants},
          {label: 'Attendance', value: `${totals.attendancePercent || 0}%`},
          {label: 'Collected Fees', value: formatCurrency(totals.paidFees || 0)},
          {label: 'Pending Fees', value: formatCurrency(totals.pendingFees || 0)},
          {label: 'Concessions', value: formatCurrency(totals.concessionFees || 0)},
        ].map(item => (
          <MetricPill key={item.label} label={item.label} value={item.value} />
        ))}
      </Animated.View>

      {/* ── Branch table ── */}
      <Animated.View style={styles.tableCard}>
        <Text style={styles.cardSection}>Branch Wise</Text>
        {branchWise.length ? (
          <View>
            {/* header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.cellBranch, styles.headerCell]}>Branch</Text>
              <Text style={[styles.cellNum, styles.headerCell]}>Stud.</Text>
              <Text style={[styles.cellNum, styles.headerCell]}>Pending</Text>
              <Text style={[styles.cellNum, styles.headerCell]}>Concession</Text>
            </View>
            {branchWise.map((row, index) => (
              <View key={row.branchId} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={styles.cellBranch} numberOfLines={1}>{row.branchCode}</Text>
                <Text style={styles.cellNum}>{row.students}</Text>
                <Text style={styles.cellNum}>{formatCurrency(row.pendingFees)}</Text>
                <Text style={styles.cellNum}>{formatCurrency(row.concessionFees)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="No report rows" message="Branch data will appear here." />
        )}
      </Animated.View>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center'},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

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
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginBottom: spacing.md, marginTop: 4},
  exportRow: {flexDirection: 'row', gap: spacing.sm},
  exportBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  exportBtnText: {color: colors.primaryDark, fontSize: 12, fontWeight: '700'},

  metricsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm},
  metricPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.md,
    ...shadows.clay},
  metricValue: {color: colors.primaryDark, fontSize: 16, fontWeight: '800'},
  metricLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},

  tableCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  cardSection: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  tableRow: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  tableHeaderRow: {backgroundColor: colors.background},
  tableRowAlt: {backgroundColor: '#F9FAFC'},
  headerCell: {color: colors.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase'},
  cellBranch: {color: colors.text, flex: 1.8, fontSize: 12, fontWeight: '600'},
  cellNum: {color: colors.text, flex: 1, fontSize: 11, fontWeight: '500', textAlign: 'right'}});

export default GlobalReportsScreen;
