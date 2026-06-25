import React from 'react';
import {Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const SuggestionStatusScreen = ({navigation}) => (
  <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Animated.View style={styles.hero}>
      <View style={styles.heroDecor} />
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
        <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
      </Pressable>
      <View style={styles.heroIconWrap}>
        <MaterialCommunityIcons name="comment-check-outline" size={36} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.heroTitle}>Suggestion Status</Text>
      <Text style={styles.heroSub}>Track your submitted suggestions</Text>
    </Animated.View>

    <Animated.View style={styles.comingSoonCard}>
      <View style={styles.comingSoonIcon}>
        <MaterialCommunityIcons name="clock-fast" size={36} color={colors.primary} />
      </View>
      <Text style={styles.comingSoonTitle}>Feature Coming Soon</Text>
      <Text style={styles.comingSoonBody}>
        We are working on giving you real-time visibility into the status of your submitted
        suggestions and feedback. Check back in the next update!
      </Text>
      <View style={styles.featureList}>
        {['Suggestion tracking', 'Principal responses', 'Status updates', 'Notification on reply'].map(f => (
          <View key={f} style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </Animated.View>

    <Pressable onPress={() => navigation.goBack()} style={styles.goBackBtn}>
      <MaterialCommunityIcons name="arrow-left" size={16} color={colors.primary} />
      <Text style={styles.goBackText}>Go Back</Text>
    </Pressable>
  </ScrollView>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: spacing.xxxl},

  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    height: 140,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140},
  backBtn: {
    marginBottom: spacing.lg,
    ...shadows.clay,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 4,
    alignSelf: 'flex-start'},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500'},

  comingSoonCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    ...shadows.clay},
  comingSoonIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64},
  comingSoonTitle: {color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center'},
  comingSoonBody: {color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: spacing.lg, textAlign: 'center'},
  featureList: {alignSelf: 'stretch', gap: spacing.sm},
  featureItem: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  featureText: {color: colors.text, fontSize: 13, fontWeight: '600'},

  goBackBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: 12,
    ...shadows.clay},
  goBackText: {color: colors.primary, fontSize: 14, fontWeight: '700'}});

export default SuggestionStatusScreen;
