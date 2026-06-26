import React, {useMemo, useState, useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View, FlatList} from 'react-native';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import {
  CustomButton,
  DashboardCard,
  EmptyState,
  FilterTabs,
  ScreenContainer,
  SectionHeader,
  SelectField,
  StatusBadge,
} from '../../components';
import feeService from '../../services/fees/feeService';
import sectionService from '../../services/sections/sectionService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import dataConnectClient from '../../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../../services/dataconnect/operations';
import academicYearService from '../../services/academicYear/academicYearService';

const statusTabs = [
  {label: 'All', value: 'ALL'},
  {label: 'Paid', value: 'PAID'},
  {label: 'Partial', value: 'PARTIAL'},
  {label: 'Due', value: 'DUE'},
  {label: 'Concession', value: 'CONCESSION'},
];

const exportReport = async (records, className, format = 'csv') => {
  try {
    const headers = ['Student Name', 'Admission Number', 'Section', 'Total Fee', 'Paid Amount', 'Due Amount', 'Concession', 'Status'];
    const rows = records.map(item => [
      item.studentName,
      item.admissionNumber,
      item.sectionName,
      item.totalFee,
      item.paidAmount,
      item.dueAmount,
      item.concessionAmount,
      item.status,
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassReport");
    
    const bookType = format === 'csv' ? 'csv' : 'xlsx';
    const wbout = XLSX.write(wb, {type: 'base64', bookType});
    
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filePath = `${RNFS.CachesDirectoryPath}/${className}_FeeReport.${ext}`;
    
    await RNFS.writeFile(filePath, wbout, 'base64');
    
    await Share.open({
      title: `${className} Fee Report`,
      url: `file://${filePath}`,
      type: mimeType,
      failOnCancel: false,
    });
  } catch (err) {
    console.error("Export error:", err);
  }
};

const StudentReportCard = ({record, onPress}) => (
  <View style={styles.studentCard}>
    <View style={styles.cardHeader}>
      <View style={{flex: 1}}>
        <Text style={styles.studentName}>{record.studentName}</Text>
        <Text style={styles.studentAdmission}>{record.admissionNumber} | Section {record.sectionName}</Text>
      </View>
      <StatusBadge status={record.status} />
    </View>
    <View style={styles.divider} />
    <View style={styles.amountsGrid}>
      <View style={styles.amountItem}>
        <Text style={styles.amountLabel}>Total Fee</Text>
        <Text style={styles.amountValue}>{formatCurrency(record.totalFee)}</Text>
      </View>
      <View style={styles.amountItem}>
        <Text style={styles.amountLabel}>Paid</Text>
        <Text style={[styles.amountValue, styles.successText]}>{formatCurrency(record.paidAmount)}</Text>
      </View>
      <View style={styles.amountItem}>
        <Text style={styles.amountLabel}>Due</Text>
        <Text style={[styles.amountValue, styles.dangerText]}>{formatCurrency(record.dueAmount)}</Text>
      </View>
    </View>
    {Number(record.concessionAmount || 0) > 0 && (
      <View style={styles.concessionRow}>
        <StatusBadge status="info" label="Concession Applied" />
        <Text style={styles.concessionValue}>-{formatCurrency(record.concessionAmount)}</Text>
      </View>
    )}
    <CustomButton mode="text" compact onPress={onPress} style={styles.viewProfileBtn}>
      View Fee Profile
    </CustomButton>
  </View>
);

const ClassWiseFeeReportScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const initialClassName = route.params?.className;
  const currentAY = academicYearService.getCurrentStartYear(access.branchId);
  const yearOptions = [
    {label: String(currentAY), value: String(currentAY)},
    {label: String(currentAY + 1), value: String(currentAY + 1)},
    {label: String(currentAY - 1), value: String(currentAY - 1)},
  ];

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(String(currentAY));
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Fetch active academic classes
  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses'],
    queryFn: () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACTIVE_ACADEMIC_CLASSES),
  });
  const classes = useMemo(() => classesQuery.data?.academicClasses || [], [classesQuery.data]);

  // Filter classes based on coordinator wing if applicable
  const coordinatorClasses = useMemo(() => {
    const branchFiltered = access.branchId
      ? classes.filter(cls => cls.branchId === access.branchId)
      : classes;
    if (access.role === 'COORDINATOR' || access.role === 'coordinator') {
      return branchFiltered.filter(cls => cls.wing?.code === access.wing);
    }
    return branchFiltered;
  }, [classes, access]);

  const classOptions = useMemo(() => {
    return coordinatorClasses.map(cls => ({label: cls.name, value: cls.id}));
  }, [coordinatorClasses]);

  // Set initial class from parameters or default to first class in list
  useEffect(() => {
    if (initialClassName && coordinatorClasses.length) {
      const matched = coordinatorClasses.find(cls => cls.name === initialClassName || cls.classCode === initialClassName);
      if (matched) {
        setSelectedClassId(matched.id);
      }
    } else if (coordinatorClasses.length && !selectedClassId) {
      setSelectedClassId(coordinatorClasses[0].id);
    }
  }, [initialClassName, coordinatorClasses, selectedClassId]);

  // Fetch sections of selected class
  const sectionsQuery = useQuery({
    queryKey: ['sectionsByClass', selectedClassId],
    queryFn: () => sectionService.getSectionsByClass(selectedClassId),
    enabled: Boolean(selectedClassId),
  });
  const sections = useMemo(() => sectionsQuery.data || [], [sectionsQuery.data]);

  const sectionOptions = useMemo(() => {
    const matchedClass = coordinatorClasses.find(c => c.id === selectedClassId);
    const className = matchedClass ? matchedClass.name : '';
    const baseOptions = [{label: 'All Sections', value: 'ALL'}];
    const fetchedOptions = sections.map(sec => ({
      label: `${className}-${sec.name}`,
      value: sec.id,
    }));
    return [...baseOptions, ...fetchedOptions];
  }, [sections, selectedClassId, coordinatorClasses]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSectionId('ALL');
  }, [selectedClassId]);

  // Fetch Class Fee Report
  const reportQuery = useQuery({
    queryKey: ['classFeeReport', access.branchId, selectedClassId, selectedSectionId, selectedYear],
    queryFn: () => feeService.getClassFeeReport({
      academicClassId: selectedClassId,
      sectionId: selectedSectionId === 'ALL' ? null : selectedSectionId,
      academicYear: Number(selectedYear),
    }, access),
    enabled: Boolean(access.branchId && selectedClassId && selectedYear),
  });

  const report = reportQuery.data || {records: [], summary: {}};
  const isTeacher = ['TEACHER', 'CLASS_TEACHER'].includes(String(access.role).toUpperCase());

  // Filter records locally by status tab
  const filteredRecords = useMemo(() => {
    return (report.records || []).filter(record => {
      if (selectedStatus === 'ALL') return true;
      if (selectedStatus === 'CONCESSION') return Number(record.concessionAmount || 0) > 0;
      return record.status === selectedStatus;
    });
  }, [report.records, selectedStatus]);

  const activeClassName = useMemo(() => {
    const matched = coordinatorClasses.find(c => c.id === selectedClassId);
    return matched ? matched.name : 'Class';
  }, [selectedClassId, coordinatorClasses]);

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.headerContainer}>
        <SectionHeader
          title={`${activeClassName} Fee Report`}
          subtitle={`Academic Year ${selectedYear}`}
        />

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <View style={styles.dropdownRow}>
          <View style={{flex: 1, marginRight: spacing.sm}}>
            <SelectField
              label="Class"
              value={selectedClassId}
              options={classOptions}
              onChange={setSelectedClassId}
            />
          </View>
          <View style={{flex: 1, marginRight: spacing.sm}}>
            <SelectField
              label="Section"
              value={selectedSectionId}
              options={sectionOptions}
              onChange={setSelectedSectionId}
              disabled={sections.length === 0}
            />
          </View>
          <View style={{flex: 0.8}}>
            <SelectField
              label="Year"
              value={selectedYear}
              options={yearOptions}
              onChange={setSelectedYear}
            />
          </View>
        </View>
        <FilterTabs
          tabs={statusTabs}
          value={selectedStatus}
          onChange={setSelectedStatus}
        />
      </View>

      {/* Export Options (Staff Only) */}
      {!isTeacher && filteredRecords.length > 0 ? (
        <View style={styles.exportRow}>
          <CustomButton
            mode="outlined"
            compact
            onPress={() => exportReport(filteredRecords, activeClassName, 'csv')}
            style={styles.exportBtn}
          >
            Export CSV
          </CustomButton>
          <CustomButton
            mode="outlined"
            compact
            onPress={() => exportReport(filteredRecords, activeClassName, 'xlsx')}
            style={styles.exportBtn}
          >
            Export Excel
          </CustomButton>
        </View>
      ) : null}
      </View>

      {reportQuery.isLoading ? (
        <ActivityIndicator animating={true} color={colors.primary} style={{marginVertical: spacing.xxl}} />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <>
              {/* Summary Cards */}
              <View style={styles.summaryGrid}>
                <View style={styles.summaryRow}>
                  <DashboardCard
                    title="Students"
                    value={String(report.summary?.totalStudents || 0)}
                    icon="account-group-outline"
                    style={styles.summaryCard}
                  />
                  <DashboardCard
                    title="Assigned"
                    value={formatCurrency(report.summary?.totalFeeAssigned || 0)}
                    icon="cash-multiple"
                    style={styles.summaryCard}
                  />
                </View>
                <View style={styles.summaryRow}>
                  <DashboardCard
                    title="Collected"
                    value={formatCurrency(report.summary?.totalFeeCollected || 0)}
                    icon="cash-check"
                    style={styles.summaryCard}
                    tone={colors.success}
                  />
                  <DashboardCard
                    title="Outstanding"
                    value={formatCurrency(report.summary?.totalOutstanding || 0)}
                    icon="cash-clock"
                    style={styles.summaryCard}
                    tone={colors.danger}
                  />
                </View>
                <View style={styles.summaryRow}>
                  <DashboardCard
                    title="Concessions"
                    value={formatCurrency(report.summary?.totalConcessions || 0)}
                    icon="sale-outline"
                    style={styles.summaryCard}
                    tone={colors.info}
                  />
                  <DashboardCard
                    title="Collection %"
                    value={`${(report.summary?.collectionPercentage || 0).toFixed(1)}%`}
                    icon="percent"
                    style={styles.summaryCard}
                  />
                </View>
              </View>
              <SectionHeader title="Students List" />
            </>
          }
          renderItem={({item}) => (
            <StudentReportCard
              record={item}
              onPress={() => navigation.navigate('StudentFeeProfile', {studentId: item.id})}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No records found"
              message="No student fees match the selected filters."
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    ...shadows.clay,
    marginBottom: spacing.md,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  exportBtn: {
    flex: 1,
  },
  summaryGrid: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
  },
  studentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    ...shadows.clay,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: 'bold',
  },
  studentAdmission: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  amountsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  amountValue: {
    ...typography.sectionTitle,
    color: colors.text,
    marginTop: spacing.xxs,
  },
  successText: {
    color: colors.success,
  },
  dangerText: {
    color: colors.danger,
  },
  concessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  concessionValue: {
    ...typography.subtitle,
    color: colors.info,
    fontWeight: 'bold',
  },
  viewProfileBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
});

export default ClassWiseFeeReportScreen;
