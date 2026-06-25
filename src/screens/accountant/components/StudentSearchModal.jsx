import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {colors, radius, shadows, spacing} from '../../../theme';
import studentService from '../../../services/students/studentService';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const StudentSearchModal = ({visible, onClose, onSelectStudent}) => {
  const {user, role} = useSelector(state => state.auth);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setResults([]);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const scope = {role, userId: user?.id};
        const searchResults = await studentService.searchStudents(
          {branchId: user?.branchId, searchText, limit: 20},
          scope,
        );
        setResults(searchResults || []);
      } catch (err) {
        setError('Failed to search students');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchText, user, role]);

  const renderStudentItem = ({item}) => {
    const classSection = [item.className, item.sectionName].filter(Boolean).join(' - ');
    const initials = item.fullName
      ? item.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
      : 'ST';

    return (
      <Pressable
        style={({pressed}) => [styles.studentCard, pressed && styles.studentCardPressed]}
        onPress={() => {
          onSelectStudent(item);
          onClose();
        }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.fullName}</Text>
          <Text style={styles.studentIdText}>ID: {item.studentId}</Text>
          {classSection ? <Text style={styles.studentClassText}>{classSection}</Text> : null}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
      </Pressable>
    );
  };

  const emptyIcon = searchText ? 'account-search-outline' : 'account-group-outline';

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Student</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Type student name or ID..."
                placeholderTextColor={colors.textSoft}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              {loading ? (
                <ActivityIndicator size="small" color={colors.secondary} style={{marginLeft: spacing.xs}} />
              ) : searchText ? (
                <Pressable onPress={() => setSearchText('')} hitSlop={8}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={colors.textSoft} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {loading && results.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.secondary} />
              <Text style={styles.helperText}>Searching registry...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.centered}>
              <MaterialCommunityIcons name={emptyIcon} size={48} color={colors.textSoft} />
              <Text style={styles.noResultsTitle}>
                {searchText ? 'No Students Found' : 'Find Student'}
              </Text>
              <Text style={styles.noResultsSub}>
                {searchText
                  ? 'Double-check spelling or try searching with student ID'
                  : 'Start typing name or ID above to find students in this branch.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id || item.studentId}
              renderItem={renderStudentItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {backgroundColor: 'rgba(14,165,233,0.08)', flex: 1, justifyContent: 'flex-end'},
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    height: SCREEN_HEIGHT * 0.85,
    ...shadows.clayModal,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTitle: {color: colors.primary, fontSize: 18, fontWeight: '700'},
  closeBtn: {alignItems: 'center', height: 36, justifyContent: 'center', width: 36},
  searchContainer: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    padding: spacing.md,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {marginRight: spacing.sm},
  searchInput: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500'},
  listContent: {gap: spacing.sm, padding: spacing.md},
  studentCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadows.clay,
  },
  studentCardPressed: {backgroundColor: colors.background, borderColor: colors.textSoft},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {color: colors.primary, fontSize: 14, fontWeight: '700'},
  studentInfo: {flex: 1, marginLeft: spacing.md},
  studentName: {color: colors.text, fontSize: 15, fontWeight: '600'},
  studentIdText: {color: colors.textSoft, fontSize: 12, fontWeight: '500', marginTop: 2},
  studentClassText: {color: colors.secondary, fontSize: 12, fontWeight: '600', marginTop: 2},
  centered: {alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl},
  helperText: {color: colors.textMuted, fontSize: 14, marginTop: spacing.sm},
  errorText: {color: colors.danger, fontSize: 14, marginTop: spacing.xs, textAlign: 'center'},
  noResultsTitle: {color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.sm},
  noResultsSub: {color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: spacing.xs, textAlign: 'center'},
});

export default StudentSearchModal;
