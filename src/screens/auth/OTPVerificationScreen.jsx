import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {clearAuthError, sendOtp, verifyOtp} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {validateOtp} from '../../utils/validators';

const OTP_LENGTH = 6;
const OTP_COUNTDOWN = 60;

// Individual animated OTP digit box
const OtpBox = ({value, focused, hasError, index}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(
        withSpring(1.15, {damping: 12, stiffness: 400}),
        withSpring(1, {damping: 15, stiffness: 300}),
      );
    }
  }, [value, scale]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  return (
    <Animated.View
      style={[
        styles.otpBox,
        value && styles.otpBoxFilled,
        focused && styles.otpBoxFocused,
        hasError && styles.otpBoxError,
        boxStyle,
      ]}>
      {value ? (
        <Text style={[styles.otpDigit, hasError && {color: colors.danger}]}>{value}</Text>
      ) : focused ? (
        <Animated.View
          style={styles.cursor}
        />
      ) : null}
    </Animated.View>
  );
};

// Progress step indicator
const StepIndicator = () => (
  <View style={styles.stepRow}>
    <View style={styles.stepDone}>
      <MaterialCommunityIcons name="check" size={12} color={colors.white} />
    </View>
    <View style={styles.stepLine} />
    <View style={styles.stepActive}>
      <Text style={styles.stepActiveNum}>2</Text>
    </View>
    <View style={[styles.stepLine, {opacity: 0.3}]} />
    <View style={styles.stepPending}>
      <Text style={styles.stepPendingNum}>3</Text>
    </View>
  </View>
);

// Countdown circle timer
const CountdownTimer = ({seconds, total}) => {
  const pct = seconds / total;
  const isUrgent = seconds <= 15;
  const timerColor = isUrgent ? colors.danger : colors.primary;

  return (
    <View style={styles.timerWrap}>
      <View style={[styles.timerRing, {borderColor: isUrgent ? colors.dangerSoft : colors.primarySoft}]}>
        <View style={[styles.timerFill, {borderColor: timerColor, opacity: pct}]} />
        <Text style={[styles.timerNum, {color: timerColor}]}>{seconds}</Text>
        <Text style={styles.timerLabel}>sec</Text>
      </View>
    </View>
  );
};

// Success overlay
const SuccessState = () => {
  const scale = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
    ring1.value = withDelay(200, withRepeat(
      withSequence(withTiming(1.5, {duration: 600}), withTiming(1, {duration: 0})),
      3, false,
    ));
    ring2.value = withDelay(300, withRepeat(
      withSequence(withTiming(1.8, {duration: 700}), withTiming(1, {duration: 0})),
      3, false,
    ));
  }, [scale, ring1, ring2]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));
  const ring1Style = useAnimatedStyle(() => ({
    transform: [{scale: ring1.value}],
    opacity: ring1.value > 1 ? 2 - ring1.value : 0}));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{scale: ring2.value}],
    opacity: ring2.value > 1 ? 2 - ring2.value : 0}));

  return (
    <Animated.View style={styles.successOverlay}>
      <View style={styles.successContent}>
        <View style={styles.successRingContainer}>
          <Animated.View style={[styles.successRing2, ring2Style]} />
          <Animated.View style={[styles.successRing1, ring1Style]} />
          <Animated.View style={[styles.successCircle, circleStyle]}>
            <MaterialCommunityIcons name="check-bold" size={40} color={colors.white} />
          </Animated.View>
        </View>
        <Animated.View>
          <Text style={styles.successTitle}>Verified!</Text>
          <Text style={styles.successSub}>Welcome to NSRIT Connect</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const OTPVerificationScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  // Pull verificationId from Redux so resend updates propagate here.
  // params.verificationId is the initial ID; state.verificationId is always current.
  const {loading, error, verificationId: reduxVerificationId} = useSelector(s => s.auth);
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [countdown, setCountdown] = useState(OTP_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const autoSubmitLock = useRef(false);

  const startCountdown = useCallback(() => {
    setCountdown(OTP_COUNTDOWN);
    setCanResend(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const params = route?.params || {};

  // Shake animation
  const shake = useSharedValue(0);
  // Card animation
  const cardOpacity = useSharedValue(1);

  const triggerShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(-10, {duration: 60}),
      withTiming(10, {duration: 60}),
      withTiming(-8, {duration: 55}),
      withTiming(8, {duration: 55}),
      withTiming(-4, {duration: 45}),
      withTiming(0, {duration: 40}),
    );
  }, [shake]);

  // Start the 60-second countdown immediately when the screen mounts.
  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startCountdown]);

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error, triggerShake]);

  const handleVerify = useCallback(async (otpValue) => {
    const code = otpValue || otp;
    const validationError = validateOtp(code);
    if (validationError) {
      setLocalError(validationError);
      triggerShake();
      return;
    }
    // Always use the most recent verificationId. After a resend, Redux state
    // holds the new ID; params.verificationId is only the initial one.
    const currentVerificationId = reduxVerificationId || params.verificationId;
    const action = await dispatch(
      verifyOtp({
        otp: code,
        countryCode: params.countryCode,
        phoneNumber: params.phoneNumber,
        verificationId: currentVerificationId}),
    );
    if (verifyOtp.fulfilled.match(action)) {
      if (action.payload.needsRoleSelection) {
        // Multiple roles — navigate to role picker without showing success animation
        navigation.navigate('RoleSelection');
      } else {
        setVerified(true);
        cardOpacity.value = withDelay(1200, withTiming(0, {duration: 400}));
      }
    } else {
      triggerShake();
    }
  }, [otp, dispatch, params, triggerShake, cardOpacity, navigation]);

  const updateOtp = useCallback((value) => {
    if (error) {
      dispatch(clearAuthError());
      // Reset the lock so auto-submit fires again on the next complete OTP.
      autoSubmitLock.current = false;
    }
    setLocalError('');
    const cleaned = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
    if (cleaned.length === OTP_LENGTH && !autoSubmitLock.current && !loading) {
      autoSubmitLock.current = true;
      setTimeout(() => handleVerify(cleaned), 150);
    }
  }, [error, dispatch, loading, handleVerify]);

  const handleResend = async () => {
    if (!canResend || resending) {
      return;
    }
    setResending(true);
    setOtp('');
    autoSubmitLock.current = false;
    dispatch(clearAuthError());
    setLocalError('');

    await dispatch(
      sendOtp({
        countryCode: params.countryCode,
        phoneNumber: params.phoneNumber}),
    );

    setResending(false);
    // sendOtp.fulfilled wrote the new verificationId into state.verificationId.
    // handleVerify already reads from reduxVerificationId so no extra wiring needed.
    startCountdown();
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shake.value}]}));

  const displayError = localError || (error ? 'Incorrect code. Please try again.' : '');
  const digits = otp.split('').concat(Array(OTP_LENGTH - otp.length).fill(''));
  const hasError = Boolean(displayError);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>

          {/* Background */}
          <View style={styles.bgBlob} />
          <View style={styles.bgBlobBottom} />

          {/* Back button */}
          <Animated.View style={styles.topRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.topTitle}>Verification</Text>
            <View style={{width: 40}} />
          </Animated.View>

          {/* Step indicator */}
          <Animated.View style={styles.stepContainer}>
            <StepIndicator />
            <Text style={styles.stepLabel}>Step 2 of 3 — Verify Code</Text>
          </Animated.View>

          {/* Shield section */}
          <Animated.View
            style={styles.iconSection}>
            <View style={styles.iconRingOuter}>
              <View style={styles.iconRingInner}>
                <MaterialCommunityIcons name="shield-check" size={38} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.heading}>Enter Verification Code</Text>
            <Text style={styles.sub}>
              Sent to{' '}
              <Text style={styles.phone}>{params.fullPhoneNumber || 'your phone'}</Text>
            </Text>
          </Animated.View>

          {/* OTP Card */}
          <Animated.View
            style={styles.card}>

            <View style={styles.cardTopRow}>
              <Text style={styles.label}>6-Digit Code</Text>
              <CountdownTimer seconds={countdown} total={OTP_COUNTDOWN} />
            </View>

            {/* OTP boxes */}
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={styles.otpContainer}>
              <Animated.View style={[styles.otpRow, shakeStyle]}>
                {digits.map((digit, i) => (
                  <OtpBox
                    key={i}
                    value={digit}
                    focused={otp.length === i && !loading}
                    hasError={hasError}
                    index={i}
                  />
                ))}
              </Animated.View>
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                value={otp}
                maxLength={OTP_LENGTH}
                onChangeText={updateOtp}
                autoFocus
                caretHidden
              />
            </Pressable>

            {/* Progress bar under boxes */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${(otp.length / OTP_LENGTH) * 100}%`,
                    backgroundColor: hasError ? colors.danger : colors.primary},
                ]}
              />
            </View>

            {/* Error */}
            {displayError ? (
              <Animated.View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
                <Text style={styles.errorText}>{displayError}</Text>
              </Animated.View>
            ) : null}

            {/* Auto-submit hint */}
            {otp.length > 0 && otp.length < OTP_LENGTH && !hasError ? (
              <Animated.View style={styles.hintRow}>
                <MaterialCommunityIcons name="information-outline" size={12} color={colors.textSoft} />
                <Text style={styles.hintText}>
                  {OTP_LENGTH - otp.length} more digit{OTP_LENGTH - otp.length !== 1 ? 's' : ''} remaining · Auto-submits on completion
                </Text>
              </Animated.View>
            ) : null}

            {/* Verify button */}
            <Pressable
              onPress={() => handleVerify()}
              disabled={loading || otp.length < OTP_LENGTH}
              style={[
                styles.verifyBtn,
                (loading || otp.length < OTP_LENGTH) && styles.verifyBtnDisabled,
              ]}>
              {loading ? (
                <View style={styles.loadingRow}>
                  <Animated.View
                    style={styles.loadingDot}
                  />
                  <Text style={styles.verifyBtnText}>Verifying…</Text>
                </View>
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.white} />
                  <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                </>
              )}
            </Pressable>

            {/* Resend row */}
            <View style={styles.resendRow}>
              {canResend ? (
                <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
                  <Animated.View style={styles.resendActiveBtn}>
                    <MaterialCommunityIcons name="refresh" size={14} color={colors.primary} />
                    <Text style={styles.resendActiveText}>
                      {resending ? 'Sending…' : 'Resend OTP'}
                    </Text>
                  </Animated.View>
                </Pressable>
              ) : (
                <Text style={styles.resendNote}>
                  Resend available in <Text style={styles.resendCountdown}>{countdown}s</Text>
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Security note */}
          <Animated.View style={styles.securityNote}>
            <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textSoft} />
            <Text style={styles.securityText}>
              Never share your OTP with anyone. NSRIT will never ask for it.
            </Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success overlay renders on top of everything */}
      {verified && <SuccessState />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background},
  flex: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md},
  // Background
  bgBlob: {
    backgroundColor: colors.primarySoft,
    borderRadius: 150,
    height: 300,
    opacity: 0.45,
    position: 'absolute',
    right: -70,
    top: -40,
    width: 300},
  bgBlobBottom: {
    backgroundColor: colors.secondarySoft,
    borderRadius: 100,
    bottom: -30,
    height: 200,
    left: -50,
    opacity: 0.35,
    position: 'absolute',
    width: 200},
  // Top row
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg},
  backBtn: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    width: 40},
  topTitle: {
    ...typography.heading,
    color: colors.text},
  // Step indicator
  stepContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg},
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6},
  stepDone: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24},
  stepLine: {
    backgroundColor: colors.primary,
    height: 2,
    opacity: 0.6,
    width: 40},
  stepActive: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24},
  stepActiveNum: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'},
  stepPending: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24},
  stepPendingNum: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'},
  stepLabel: {
    ...typography.caption,
    color: colors.textMuted},
  // Icon section
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing.xl},
  iconRingOuter: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 8,
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 96},
  iconRingInner: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 66,
    justifyContent: 'center',
    width: 66},
  heading: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center'},
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center'},
  phone: {
    color: colors.primary,
    fontWeight: '800'},
  // Card
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.xl},
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg},
  label: {
    ...typography.label,
    color: colors.text},
  // Timer
  timerWrap: {
    alignItems: 'center'},
  timerRing: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 46,
    justifyContent: 'center',
    width: 46},
  timerFill: {
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 40,
    position: 'absolute',
    width: 40},
  timerNum: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16},
  timerLabel: {
    color: colors.textSoft,
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 10},
  // OTP boxes
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm},
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: spacing.sm},
  otpBox: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    width: 44},
  otpBoxFilled: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primary},
  otpBoxFocused: {
    ...shadows.clayInset,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2.5},
  otpBoxError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger},
  otpDigit: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900'},
  cursor: {
    backgroundColor: colors.primary,
    borderRadius: 1,
    height: 22,
    width: 2},
  hiddenInput: {
    height: 0,
    opacity: 0,
    position: 'absolute',
    width: 0},
  // Progress bar
  progressTrack: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    height: 3,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  progressFill: {
    borderRadius: radius.pill,
    height: 3},
  // Error
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 12,
    fontWeight: '600'},
  // Hint
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginBottom: spacing.sm},
  hintText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500'},
  // Verify button
  verifyBtn: {
    ...shadows.fab,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 54,
    justifyContent: 'center',
    marginTop: spacing.sm},
  verifyBtnDisabled: {
    backgroundColor: colors.textSoft,
    shadowOpacity: 0,
    elevation: 0},
  verifyBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2},
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm},
  loadingDot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    height: 8,
    width: 8},
  // Resend
  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg},
  resendNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center'},
  resendCountdown: {
    color: colors.primary,
    fontWeight: '700'},
  resendActiveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  resendActiveText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'},
  // Security note
  securityNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg},
  securityText: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center'},
  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.97)',
    justifyContent: 'center',
    zIndex: 999},
  successContent: {
    alignItems: 'center',
    gap: spacing.xl},
  successRingContainer: {
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    width: 160},
  successCircle: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    position: 'absolute',
    width: 96,
    shadowColor: colors.success,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8},
  successRing1: {
    backgroundColor: 'transparent',
    borderColor: colors.success,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 120,
    opacity: 0.4,
    position: 'absolute',
    width: 120},
  successRing2: {
    backgroundColor: 'transparent',
    borderColor: colors.success,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 150,
    opacity: 0.2,
    position: 'absolute',
    width: 150},
  successTitle: {
    ...typography.title,
    color: colors.success,
    textAlign: 'center'},
  successSub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center'}});

export default OTPVerificationScreen;
