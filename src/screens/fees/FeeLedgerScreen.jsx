import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState, FeeCard, SearchBar} from '../../components';
import {setSelectedStudentFee} from '../../store/slices/feeSlice';
import {colors, radius, shadows, spacing} from '../../theme';

const FeeLedgerScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const records = useSelector(state => state.fees.records);

  const filteredRecords = useMemo(
    () =>
      records.filter(item =>
        `${item.studentName} ${item.className} ${item.sectionName}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, records],
  );

  const openDetails = item => {
    dispatch(setSelectedStudentFee(item));
    navigation.navigate('StudentFeeDetails');
  };

  return (
    <FlatList
      data={filteredRecords}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <Animated.View style={styles.hero}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>Fees</Text>
            <Text style={styles.heroTitle}>Fee Ledger</Text>
            <Text style={styles.heroSub}>Student-wise fee balances and ledger status</Text>
          </Animated.View>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search ledger" />
        </View>
      }
      renderItem={({item}) => <FeeCard student={item} onPress={() => openDetails(item)} />}
      ListEmptyComponent={
        <EmptyState title="No ledger records" message="Fee records will appear here." />
      }
    />
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
    height: 120,
    position: 'absolute',
    right: -20,
    top: -35,
    width: 120},
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4}});

export default FeeLedgerScreen;
