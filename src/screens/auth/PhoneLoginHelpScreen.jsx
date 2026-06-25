import React from 'react';
import {Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const STEPS = [
  {icon: 'cellphone', title: 'Enter your phone number', body: 'Use the mobile number registered by your school at the time of enrolment.'},
  {icon: 'message-text-outline', title: 'Receive OTP', body: 'A 6-digit OTP will be sent via SMS to your registered phone number.'},
  {icon: 'shield-check-outline', title: 'Enter OTP to sign in', body: 'Type the code in the verification screen within 5 minutes to log in.'},
];

const PhoneLoginHelpScreen = ({navigation}) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
  <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Animated.View style={styles.hero}>
      <View style={styles.heroDecor} />
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
        <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
      </Pressable>
      <View style={styles.heroIconWrap}>
        <MaterialCommunityIcons name="help-circle-outline" size={36} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.heroTitle}>How to Sign In</Text>
      <Text style={styles.heroSub}>Phone number + OTP verification</Text>
    </Animated.View>

    {STEPS.map((step, i) => (
      <Animated.View
        key={step.title}
        style={styles.stepCard}>
        <View style={styles.stepNum}>
          <Text style={styles.stepNumText}>{i + 1}</Text>
        </View>
        <View style={styles.stepIconWrap}>
          <MaterialCommunityIcons name={step.icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.stepCopy}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </View>
      </Animated.View>
    ))}

    <Animated.View style={styles.noteCard}>
      <MaterialCommunityIcons name="information-outline" size={18} color={colors.info} style={styles.noteIcon} />
      <View style={styles.noteCopy}>
        <Text style={styles.noteTitle}>Number not registered?</Text>
        <Text style={styles.noteBody}>
          Contact your school office or administrator to update the phone number linked to your account.
        </Text>
      </View>
    </Animated.View>

    <Pressable onPress={() => navigation.goBack()} style={styles.backCta}>
      <MaterialCommunityIcons name="arrow-left" size={16} color={colors.primary} />
      <Text style={styles.backCtaText}>Back to Login</Text>
    </Pressable>
  </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 56},

  hero: {
    ...shadows.clayDeep,
    alignItems: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'relative'},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    height: 140,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140},
  backBtn: {marginBottom: spacing.md},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 60,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 60},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500'},

  stepCard: {
    ...shadows.clay,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md},
  stepNum: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    minWidth: 24},
  stepNumText: {color: colors.primary, fontSize: 11, fontWeight: '800'},
  stepIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40},
  stepCopy: {flex: 1},
  stepTitle: {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 2},
  stepBody: {color: colors.textMuted, fontSize: 12, lineHeight: 17},

  noteCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderColor: `${colors.info}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md},
  noteIcon: {marginTop: 1},
  noteCopy: {flex: 1},
  noteTitle: {color: colors.info, fontSize: 13, fontWeight: '800', marginBottom: 2},
  noteBody: {color: colors.text, fontSize: 12, lineHeight: 17},

  backCta: {
    ...shadows.clayInset,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: 12},
  backCtaText: {color: colors.primary, fontSize: 14, fontWeight: '700'}});

export default PhoneLoginHelpScreen;
