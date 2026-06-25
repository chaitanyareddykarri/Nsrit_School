import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, FilterTabs, SearchBar} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const exportReport = async (records, format = 'csv') => {
  try {
    const headers = ['Student', 'Admission Number', 'Class', 'Section', 'Total Fee', 'Paid Amount', 'Pending Amount', 'Concession'];
    const rows = records.map(item => [
      item.studentName, item.admissionNumber, item.className, item.sectionName,
      item.totalFee, item.paidAmount, item.dueAmount, item.concessionAmount,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const bookType = format === 'csv' ? 'csv' : 'xlsx';
    const wbout = XLSX.write(wb, {type: 'base64', bookType});
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filePath = `${RNFS.CachesDirectoryPath}/FeeReport.${ext}`;
    await RNFS.writeFile(filePath, wbout, 'base64');
    await Share.open({title: 'Fee Report', url: `file://${filePath}`, type: mimeType, failOnCancel: false});
  } catch (err) {
    console.error('Export error:', err);
  }
};

const statusTabs = [
  {label: 'All', value: 'ALL'},
  {label: 'Paid', value: 'PAID'},
  {label: 'Partial', value: 'PARTIAL'},
  {label: 'Due', value: 'DUE'},
  {label: 'Concession', value: 'CONCESSION'},
  {label: 'Transport', value: 'TRANSPORT'},
  {label: 'Books', value: 'BOOKS'},
];

const SummaryPill = ({label, value, color}) => (
  <View style={styles.summaryPill}>
    <Text style={[styles.summaryPillValue, color && {color}]}>{value}</Text>
    <Text style={styles.summaryPillLabel}>{label}</Text>
  </View>
);

const FeeReportsScreen = ({navigation}) => {
  const access = useFeeAccess();
  const canViewReports = feeService.canViewReports(access.role);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const {data, error, isLoading} = useQuery({
    queryKey: ['feeReports', access.branchId, access.role, access.wing, access.sectionId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId && canViewReports)});
  const filtered = useMemo(() => {
    const records = data?.records || [];
    return records.filter(
      item =>
        `${item.studentName} ${item.admissionNumber} ${item.className} ${item.sectionName}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === 'ALL' ||
          item.status === status ||
          (status === 'CONCESSION' && Number(item.concessionAmount || 0) > 0) ||
          (status === 'TRANSPORT' && Number(item.transportFee || 0) > 0) ||
          (status === 'BOOKS' && Number(item.booksFee || 0) > 0)),
    );
  }, [query, status, data?.records]);

  if (!canViewReports) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Access denied"
          message="Only coordinators, accountants, principals, branch admins, and main admins can view fee reports."
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Fee</Text>
              <Text style={styles.heroTitle}>Reports</Text>
              <Text style={styles.heroSub}>{isLoading ? 'Loading reports…' : 'Branch fee analytics'}</Text>
              {!['TEACHER', 'CLASS_TEACHER'].includes(String(access.role).toUpperCase()) ? (
                <View style={styles.exportRow}>
                  <Pressable
                    onPress={() => exportReport(filtered, 'csv')}
                    style={({pressed}) => [styles.exportBtn, pressed && {opacity: 0.85}]}>
                    <MaterialCommunityIcons name="file-delimited-outline" size={13} color={colors.secondary} />
                    <Text style={styles.exportBtnText}>CSV</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => exportReport(filtered, 'xlsx')}
                    style={({pressed}) => [styles.exportBtn, pressed && {opacity: 0.85}]}>
                    <MaterialCommunityIcons name="microsoft-excel" size={13} color={colors.secondary} />
                    <Text style={styles.exportBtnText}>Excel</Text>
                  </Pressable>
                </View>
              ) : null}
            </Animated.View>

            {/* ── Summary ── */}
            <Animated.View style={styles.summaryRow}>
              <SummaryPill label="Total" value={formatCurrency(data?.summary?.totalFee || 0)} />
              <SummaryPill label="Collected" value={formatCurrency(data?.summary?.paidAmount || 0)} color={colors.success} />
              <SummaryPill label="Pending" value={formatCurrency(data?.summary?.dueAmount || 0)} color={colors.danger} />
              <SummaryPill label="Concession" value={formatCurrency(data?.summary?.concessionAmount || 0)} color={colors.warning} />
            </Animated.View>

            <SearchBar value={query} onChangeText={setQuery} placeholder="Filter by student, class" />
            <FilterTabs tabs={statusTabs} value={status} onChange={setStatus} />
            {/* Class-wise report */}
            {(data?.classWise || []).length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Class-wise Report</Text>
                {data.classWise.map((item, index) => (
                  <Animated.View key={item.className}>
                    <Pressable onPress={() => navigation.navigate('ClassWiseFeeReport', { className: item.className })}>
                      <View style={styles.classRow}>
                        <View style={styles.classIcon}>
                          <MaterialCommunityIcons name="file-chart-outline" size={14} color={colors.secondary} />
                        </View>
                        <View style={styles.classBody}>
                          <Text style={styles.classTitle}>{item.className}</Text>
                          <Text style={styles.classMeta}>
                            {item.students} students · Collected {formatCurrency(item.paidAmount)}
                          </Text>
                        </View>
                        <View style={styles.classRight}>
                          <Text style={[styles.classDue, {color: item.dueAmount > 0 ? colors.danger : colors.success}]}>
                            {formatCurrency(item.dueAmount)}
                          </Text>
                          <Text style={styles.classDueLabel}>pending</Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </>
            ) : null}

            <Text style={styles.sectionLabel}>Student-wise Report</Text>
          </View>
        }
        renderItem={({item, index}) => (
          <Animated.View>
            <View style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName} numberOfLines={1}>{item.studentName}</Text>
                <Text style={styles.studentMeta}>{item.className}-{item.sectionName} · #{item.admissionNumber}</Text>
                <Text style={styles.studentPayment}>
                  Paid {formatCurrency(item.paidAmount)} · Concession {formatCurrency(item.concessionAmount)}
                </Text>
              </View>
              <View style={styles.studentDueWrap}>
                <Text style={[styles.studentDue, {color: item.dueAmount > 0 ? colors.danger : colors.success}]}>
                  {formatCurrency(item.dueAmount)}
                </Text>
                <Text style={styles.studentDueLabel}>due</Text>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={error ? 'Unable to load reports' : 'No report records'}
            message={error?.message || 'Fee plans and payments will appear here.'}
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.secondary,
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
  exportBtnText: {color: colors.secondary, fontSize: 12, fontWeight: '700'},

  summaryRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    ...shadows.clay},
  summaryPill: {alignItems: 'center', flex: 1, padding: spacing.md},
  summaryPillValue: {color: colors.text, fontSize: 13, fontWeight: '800'},
  summaryPillLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase'},

  classRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  classIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32},
  classBody: {flex: 1},
  classTitle: {...typography.bodyBold, color: colors.text},
  classMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  classRight: {alignItems: 'flex-end'},
  classDue: {fontSize: 13, fontWeight: '800'},
  classDueLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '600'},

  studentRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  studentInfo: {flex: 1},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  studentPayment: {color: colors.textSoft, fontSize: 10, fontWeight: '500', marginTop: 2},
  studentDueWrap: {alignItems: 'flex-end', justifyContent: 'center', paddingLeft: spacing.sm},
  studentDue: {fontSize: 13, fontWeight: '800'},
  studentDueLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '600'}});

export default FeeReportsScreen;
