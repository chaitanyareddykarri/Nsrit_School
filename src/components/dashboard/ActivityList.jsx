import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing, typography} from '../../theme';

const ActivityList = ({items}) => (
  <View style={styles.container}>
    {items.map(item => (
      <View key={item.id} style={styles.item}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name={item.icon || 'bell-outline'}
            size={18}
            color={colors.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    padding: spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 38,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  time: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});

export default ActivityList;
