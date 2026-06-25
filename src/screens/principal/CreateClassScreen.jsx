import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const CreateClassScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Classes are system-managed"
      message="Nursery through 12 are seeded automatically. Principals can create sections only."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default CreateClassScreen;
