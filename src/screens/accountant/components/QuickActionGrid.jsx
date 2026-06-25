import React from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const QuickActionGrid = ({navigation, actions}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, idx) => (
          <Pressable
            key={idx}
            style={({pressed}) => [
              styles.card,
              {borderColor: action.color || colors.primary},
              pressed && styles.pressedCard,
            ]}
            onPress={() => navigation.navigate(action.route)}>
            <View style={[styles.iconBadge, {backgroundColor: action.bgColor || colors.primarySoft}]}>
              <MaterialCommunityIcons name={action.icon} size={24} color={action.color || colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{action.title}</Text>
              <Text style={styles.subtitle}>{action.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: spacing.lg, paddingVertical: spacing.sm},
  sectionTitle: {color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: spacing.sm},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md},
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.md,
    width: ITEM_WIDTH,
    ...shadows.clay,
  },
  pressedCard: {opacity: 0.85, transform: [{scale: 0.98}]},
  iconBadge: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 44,
  },
  textContainer: {width: '100%'},
  title: {color: colors.text, fontSize: 13, fontWeight: '800'},
  subtitle: {color: colors.textMuted, fontSize: 10, marginTop: 2},
});

export default QuickActionGrid;
