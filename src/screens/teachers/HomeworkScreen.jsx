import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const TABS = ['Pending', 'Submitted', 'Graded'];

const FEATURE_LIST = [
  {icon: 'plus-circle-outline', label: 'Create assignments with due dates'},
  {icon: 'file-upload-outline', label: 'Students submit via the parent app'},
  {icon: 'check-circle-outline', label: 'Grade and provide feedback'},
  {icon: 'chart-bar-outline', label: 'Track completion rates by class'},
];

const HomeworkScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('Pending');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>Homework</Text>
        <Text style={styles.heroSub}>Manage assignments for your students</Text>
      </Animated.View>

      {/* Tabs */}
      <Animated.View style={styles.tabRow}>
        {TABS.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Coming Soon Banner */}
      <Animated.View style={styles.comingSoon}>
        <View style={styles.comingSoonIcon}>
          <MaterialCommunityIcons name="rocket-launch-outline" size={28} color={colors.secondary} />
        </View>
        <Text style={styles.comingSoonTitle}>Homework Management</Text>
        <Text style={styles.comingSoonBody}>
          The homework module is coming soon. Assign tasks, track submissions, and grade student work — all from the app.
        </Text>
      </Animated.View>

      {/* Feature list */}
      <Animated.View style={styles.featureCard}>
        <Text style={styles.featureTitle}>What's coming</Text>
        {FEATURE_LIST.map((item, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <MaterialCommunityIcons name={item.icon} size={16} color={colors.secondary} />
            </View>
            <Text style={styles.featureLabel}>{item.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Quick action */}
      <Animated.View style={styles.ctaWrap}>
        <Pressable
          onPress={() => navigation.navigate('TakeAttendance')}
          style={({pressed}) => [styles.cta, pressed && {opacity: 0.8}]}>
          <MaterialCommunityIcons name="calendar-check" size={18} color={colors.white} />
          <Text style={styles.ctaText}>Take Attendance Instead</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [styles.ctaOutline, pressed && {opacity: 0.8}]}>
          <Text style={styles.ctaOutlineText}>Go Back</Text>
        </Pressable>
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},

  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
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
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 64},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '900'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4},

  tabRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    overflow: 'hidden'},
  tab: {alignItems: 'center', flex: 1, paddingVertical: 11},
  tabActive: {backgroundColor: colors.secondary},
  tabLabel: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  tabLabelActive: {color: colors.white},

  comingSoon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    ...shadows.clay},
  comingSoonIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56},
  comingSoonTitle: {color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center'},
  comingSoonBody: {color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center'},

  featureCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.clay},
  featureTitle: {color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: spacing.md},
  featureRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, paddingVertical: 6},
  featureIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    height: 28,
    justifyContent: 'center',
    width: 28},
  featureLabel: {color: colors.text, flex: 1, fontSize: 13, fontWeight: '500'},

  ctaWrap: {gap: spacing.sm},
  cta: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: 14},
  ctaText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  ctaOutline: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: 13},
  ctaOutlineText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'}});

export default HomeworkScreen;
