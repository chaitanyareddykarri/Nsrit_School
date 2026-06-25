import React, {useState} from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Modal, Portal} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const INITIAL_BATCHES = [
  {id: 'b1', subject: 'Advanced Mathematics', className: 'XII-A', teacher: 'Prof. M. Sharma', avatarLabel: 'MS', status: 'Ready to Post', totalStudents: 32, submittingDate: '2026-06-08'},
  {id: 'b2', subject: 'Organic Chemistry', className: 'XII-B', teacher: 'Dr. A. Sen', avatarLabel: 'AS', status: 'Ready to Post', totalStudents: 28, submittingDate: '2026-06-07'},
  {id: 'b3', subject: 'Modern History', className: 'XII-C', teacher: 'Prof. L. Dsouza', avatarLabel: 'LD', status: 'Draft', totalStudents: 30, submittingDate: '2026-06-09'},
  {id: 'b4', subject: 'Physical Education', className: 'XII-A', teacher: 'Coach R. Kumar', avatarLabel: 'RK', status: 'Posted', totalStudents: 32, submittingDate: '2026-06-05'},
  {id: 'b5', subject: 'English Literature', className: 'XI-A', teacher: 'Ms. S. Iyer', avatarLabel: 'SI', status: 'Draft', totalStudents: 35, submittingDate: '2026-06-09'},
  {id: 'b6', subject: 'Business Studies', className: 'XI-B', teacher: 'Mr. J. Shah', avatarLabel: 'JS', status: 'Posted', totalStudents: 34, submittingDate: '2026-06-04'},
];

const filterStatuses = ['All', 'Ready to Post', 'Draft', 'Posted'];
const filterClasses = ['All', 'XI', 'XII'];

const getStatusColor = status => {
  switch (status) {
    case 'Ready to Post': return {bg: colors.successSoft, text: colors.success};
    case 'Draft': return {bg: colors.warningSoft, text: colors.warning};
    case 'Posted': return {bg: colors.primarySoft, text: colors.primary};
    default: return {bg: colors.background, text: colors.textMuted};
  }
};

const ResultPostingScreen = ({navigation}) => {
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch =
      batch.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.teacher.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || batch.status === selectedStatus;
    const matchesClass = selectedClass === 'All' || batch.className.startsWith(selectedClass);
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handlePostPress = batch => {
    setSelectedBatch(batch);
    setConfirmVisible(true);
  };

  const confirmPost = () => {
    if (!selectedBatch) {return;}
    setBatches(prev =>
      prev.map(item => item.id === selectedBatch.id ? {...item, status: 'Posted'} : item),
    );
    setConfirmVisible(false);
    setSelectedBatch(null);
  };

  const renderBatchItem = ({item}) => {
    const statusStyle = getStatusColor(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
              <Text style={[styles.statusBadgeText, {color: statusStyle.text}]}>{item.status}</Text>
            </View>
            <Text style={styles.classText}>Grade {item.className}</Text>
          </View>
          <Text style={styles.dateText}>{item.submittingDate}</Text>
        </View>

        <Text style={styles.subjectText}>{item.subject}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.teacherRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.avatarLabel}</Text>
            </View>
            <Text style={styles.teacherName}>{item.teacher}</Text>
          </View>
          <View style={styles.studentsCountRow}>
            <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.textSoft} />
            <Text style={styles.studentsCountText}>{item.totalStudents} students</Text>
          </View>
        </View>

        {item.status === 'Ready to Post' ? (
          <Pressable
            onPress={() => handlePostPress(item)}
            style={({pressed}) => [styles.postBtn, pressed && {opacity: 0.88}]}>
            <Text style={styles.postBtnText}>Post Results</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Result Posting Console</Text>
          <Text style={styles.headerSubtitle}>Publish term grades to parent feeds</Text>
        </View>
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject or teacher..."
            placeholderTextColor={colors.textSoft}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textSoft} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterStatuses.map(status => {
            const isSelected = selectedStatus === status;
            return (
              <Pressable
                key={status}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedStatus(status)}>
                <Text style={[styles.filterChipLabel, isSelected && styles.filterChipLabelSelected]}>
                  {status}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.verticalDivider} />
          {filterClasses.map(grade => {
            const isSelected = selectedClass === grade;
            return (
              <Pressable
                key={grade}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedClass(grade)}>
                <Text style={[styles.filterChipLabel, isSelected && styles.filterChipLabelSelected]}>
                  {grade === 'All' ? 'All Grades' : `Grade ${grade}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBatches}
        keyExtractor={item => item.id}
        renderItem={renderBatchItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-remove-outline" size={48} color={colors.textSoft} />
            <Text style={styles.emptyTitle}>No batches found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjustments to your search queries or active filter tags.
            </Text>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={confirmVisible}
          onDismiss={() => setConfirmVisible(false)}
          contentContainerStyle={styles.confirmModal}>
          <Text style={styles.confirmTitle}>Publish Batch Results</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to publish final grades for{' '}
            <Text style={styles.confirmBold}>
              {selectedBatch?.subject} (Grade {selectedBatch?.className})
            </Text>
            ? This will broadcast immediate result updates to student portfolios and parent dashboard streams.
          </Text>
          <View style={styles.confirmActions}>
            <Pressable
              onPress={() => setConfirmVisible(false)}
              style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.88}]}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={confirmPost}
              style={({pressed}) => [styles.confirmBtn, pressed && {opacity: 0.88}]}>
              <Text style={styles.confirmBtnText}>Post Results</Text>
            </Pressable>
          </View>
        </Modal>
      </Portal>
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
  backBtn: {alignItems: 'center', height: 36, justifyContent: 'center', width: 36},
  headerTitle: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  headerSubtitle: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},

  filterPanel: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {marginRight: spacing.sm},
  searchInput: {color: colors.text, flex: 1, fontSize: 13, fontWeight: '500', height: 44},
  filterScroll: {alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs},
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  filterChipSelected: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterChipLabel: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  filterChipLabelSelected: {color: colors.white, fontWeight: '700'},
  verticalDivider: {backgroundColor: colors.border, height: 20, marginHorizontal: spacing.xs, width: 1},

  listContainer: {gap: spacing.md, padding: spacing.lg},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.md,
    ...shadows.clay,
  },
  cardHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs},
  cardHeaderLeft: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  statusBadge: {borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2},
  statusBadgeText: {fontSize: 10, fontWeight: '700', textTransform: 'uppercase'},
  classText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  dateText: {color: colors.textSoft, fontSize: 10, fontWeight: '500'},
  subjectText: {color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: spacing.md},
  cardFooter: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  teacherRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  avatarText: {color: colors.primary, fontSize: 8, fontWeight: '700'},
  teacherName: {color: colors.text, fontSize: 12, fontWeight: '600'},
  studentsCountRow: {alignItems: 'center', flexDirection: 'row', gap: 4},
  studentsCountText: {color: colors.textSoft, fontSize: 11, fontWeight: '500'},
  postBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginTop: spacing.md,
    paddingVertical: 10,
    ...shadows.fab,
  },
  postBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},

  emptyContainer: {alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl},
  emptyTitle: {color: colors.text, fontSize: 15, fontWeight: '700', marginTop: spacing.sm},
  emptySubtitle: {color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4, paddingHorizontal: spacing.xl, textAlign: 'center'},

  confirmModal: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.clayModal,
  },
  confirmTitle: {color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.md},
  confirmText: {color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg},
  confirmBold: {color: colors.text, fontWeight: '700'},
  confirmActions: {flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end'},
  cancelBtn: {borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, paddingHorizontal: spacing.lg, paddingVertical: 10},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  confirmBtn: {alignItems: 'center', backgroundColor: colors.secondary, borderRadius: radius.card, paddingHorizontal: spacing.lg, paddingVertical: 10, ...shadows.fab},
  confirmBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
});

export default ResultPostingScreen;
