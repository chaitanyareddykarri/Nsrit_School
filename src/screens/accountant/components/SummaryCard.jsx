import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../../theme';

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon = 'currency-usd',
  tone = colors.primary,
  percentage,
  isIncrease = true,
  style,
}) => {
  return (
    <View style={[styles.card, {backgroundColor: tone}, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon} size={36} color="rgba(255,255,255,0.42)" />
        </View>
      </View>
      {(percentage !== undefined || subtitle) ? (
        <View style={styles.footer}>
          {percentage !== undefined ? (
            <View style={styles.trendContainer}>
              <MaterialCommunityIcons
                name={isIncrease ? 'trending-up' : 'trending-down'}
                size={14}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.trendText}>
                {percentage}% {isIncrease ? 'increase' : 'decrease'}
              </Text>
            </View>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.hero,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
    ...shadows.clayDeep,
  },
  title: {color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: spacing.xs},
  valueRow: {alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between'},
  value: {color: colors.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.5},
  iconWrap: {bottom: -10, position: 'absolute', right: -10},
  footer: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm},
  trendContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  trendText: {color: colors.white, fontSize: 10, fontWeight: '700'},
  subtitle: {color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500'},
});

export default SummaryCard;
