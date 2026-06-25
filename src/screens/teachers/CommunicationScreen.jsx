import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const CommunicationScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Communication is out of scope"
      message="Messaging is not included in phases 1-4."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default CommunicationScreen;
