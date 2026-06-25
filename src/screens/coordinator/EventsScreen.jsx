import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const EventsScreen = () => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
  <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Animated.View style={styles.hero}>
      <View style={styles.heroDecor} />
      <View style={styles.heroIconWrap}>
        <MaterialCommunityIcons name="calendar-star" size={40} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.heroTitle}>Events</Text>
      <Text style={styles.heroSub}>School events and announcements</Text>
    </Animated.View>

    <Animated.View style={styles.comingSoonCard}>
      <View style={styles.comingSoonIcon}>
        <MaterialCommunityIcons name="clock-outline" size={36} color={colors.info} />
      </View>
      <Text style={styles.comingSoonTitle}>Coming Soon</Text>
      <Text style={styles.comingSoonBody}>
        Event scheduling, announcements, and coordination tools are being developed
        for the Coordinator role.
      </Text>
      <View style={styles.featureList}>
        {['School event calendar', 'Announcement broadcasting', 'Parent notifications', 'Event attendance tracking'].map(f => (
          <View key={f} style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 80},

  hero: {
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xxl,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    height: 160,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500'},

  comingSoonCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.xl,
    ...shadows.clay},
  comingSoonIcon: {
    alignItems: 'center',
    backgroundColor: `${colors.info}15`,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64},
  comingSoonTitle: {color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center'},
  comingSoonBody: {color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: spacing.lg, textAlign: 'center'},
  featureList: {alignSelf: 'stretch', gap: spacing.sm},
  featureItem: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  featureText: {color: colors.text, fontSize: 13, fontWeight: '600'}});

export default EventsScreen;
