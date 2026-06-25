import React, {useEffect, useRef, useState} from 'react';
import {
  Animated as RNAnimated,
  Easing,
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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {clearAuthError, sendOtp} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {validatePhoneLogin} from '../../utils/validators';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COUNTRY_CODES = [
  {code: '+91', flag: '🇮🇳', name: 'India'},
  {code: '+1', flag: '🇺🇸', name: 'USA'},
  {code: '+44', flag: '🇬🇧', name: 'UK'},
];

// Shimmer component for loading state
const ShimmerBox = ({style}) => {
  const shimmer = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.timing(shimmer, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true}),
    ).start();
  }, [shimmer]);
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200]});
  return (
    <View style={[styles.shimmerContainer, style]}>
      <RNAnimated.View
        style={[
          styles.shimmerHighlight,
          {transform: [{translateX}]},
        ]}
      />
    </View>
  );
};

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading, error, isSwitchingUser} = useSelector(state => state.auth);
  const [form, setForm] = useState({countryCode: '+91', phoneNumber: ''});
  const [localError, setLocalError] = useState('');
  const [focused, setFocused] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Button scale animation
  const btnScale = useSharedValue(1);
  // Error shake animation
  const shake = useSharedValue(0);
  // Logo float animation
  const logoFloat = useSharedValue(0);
  // Input check mark scale
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Gentle floating animation for the logo
    logoFloat.value = withRepeat(
      withSequence(
        withTiming(-6, {duration: 2000}),
        withTiming(0, {duration: 2000}),
      ),
      -1,
      false,
    );
  }, [logoFloat]);

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  useEffect(() => {
    const valid = form.phoneNumber.replace(/\D/g, '').length === 10;
    setIsValid(valid);
    checkScale.value = withSpring(valid ? 1 : 0, {damping: 15, stiffness: 300});
  }, [form.phoneNumber, checkScale]);

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-10, {duration: 60}),
      withTiming(10, {duration: 60}),
      withTiming(-8, {duration: 55}),
      withTiming(8, {duration: 55}),
      withTiming(-4, {duration: 45}),
      withTiming(0, {duration: 40}),
    );
  };

  const updateField = (field, value) => {
    if (error) {dispatch(clearAuthError());}
    setLocalError('');
    if (field === 'phoneNumber') {
      setForm(c => ({...c, [field]: value.replace(/\D/g, '').slice(0, 10)}));
    } else {
      setForm(c => ({...c, [field]: value}));
    }
  };

  const handleSendOtp = async () => {
    const validationError = validatePhoneLogin(form);
    if (validationError) {
      setLocalError(validationError);
      triggerShake();
      return;
    }
    const action = await dispatch(sendOtp(form));
    if (sendOtp.fulfilled.match(action)) {
      navigation.navigate('OTPVerification', {
        ...form,
        verificationId: action.payload.verificationId,
        fullPhoneNumber: action.payload.fullPhoneNumber});
    } else {
      triggerShake();
    }
  };

  const handleBtnPressIn = () => {
    btnScale.value = withSpring(0.96, {damping: 20, stiffness: 300});
  };
  const handleBtnPressOut = () => {
    btnScale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{scale: btnScale.value}]}));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shake.value}]}));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{translateY: logoFloat.value}]}));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{scale: checkScale.value}],
    opacity: checkScale.value}));

  const displayError = localError || (error ? 'Unable to connect. Check your number and try again.' : '');
  const selectedCountry = COUNTRY_CODES.find(c => c.code === form.countryCode) || COUNTRY_CODES[0];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Animated gradient blobs */}
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />
        <View style={styles.bgBlob3} />

        {/* Hero section */}
        <Animated.View
          style={styles.hero}>
          <Animated.View style={[styles.logoRing, logoStyle]}>
            <View style={styles.logoInner}>
              <MaterialCommunityIcons name="school" size={38} color={colors.primary} />
            </View>
            {/* Decorative ring dots */}
            <View style={[styles.ringDot, {top: 2, right: 14}]} />
            <View style={[styles.ringDot, styles.ringDotSmall, {bottom: 6, left: 10}]} />
          </Animated.View>

          <Animated.View>
            <Text style={styles.brandName}>NSRIT Connect</Text>
          </Animated.View>
          <Animated.View>
            <Text style={styles.brandTagline}>Enterprise School Management</Text>
          </Animated.View>

          {/* Decorative badge */}
          <Animated.View style={styles.badge}>
            <MaterialCommunityIcons name="shield-check" size={10} color={colors.success} />
            <Text style={styles.badgeText}>Secured with Firebase</Text>
          </Animated.View>
        </Animated.View>

        {/* Login card */}
        <Animated.View
          style={styles.card}>

          <View style={styles.cardAccentBar} />

          <Text style={styles.cardTitle}>
            {isSwitchingUser ? 'Switch Account' : 'Sign In'}
          </Text>
          <Text style={styles.cardSub}>
            {isSwitchingUser
              ? 'Enter the phone number of the account you want to sign in to'
              : 'Enter your registered phone number to receive a one-time verification code'}
          </Text>

          {/* Phone input */}
          <Text style={styles.inputLabel}>
            <MaterialCommunityIcons name="phone" size={11} color={colors.textMuted} />
            {'  '}PHONE NUMBER
          </Text>

          <Animated.View style={shakeStyle}>
            <View style={styles.phoneRow}>
              {/* Country code picker */}
              <Pressable
                onPress={() => setShowCountryPicker(!showCountryPicker)}
                style={[
                  styles.codeBtn,
                  focused === 'code' && styles.inputFocused,
                ]}>
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Text style={styles.codeText}>{selectedCountry.code}</Text>
                <MaterialCommunityIcons
                  name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.textMuted}
                />
              </Pressable>

              {/* Phone number input */}
              <View
                style={[
                  styles.phoneInput,
                  focused === 'phone' && styles.inputFocused,
                  displayError ? styles.inputError : null,
                  isValid && !displayError ? styles.inputSuccess : null,
                ]}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={16}
                  color={
                    displayError
                      ? colors.danger
                      : focused === 'phone'
                      ? colors.primary
                      : colors.textSoft
                  }
                  style={{marginRight: 6}}
                />
                <TextInput
                  keyboardType="phone-pad"
                  value={form.phoneNumber}
                  placeholder="10-digit number"
                  placeholderTextColor={colors.textSoft}
                  style={styles.input}
                  onChangeText={v => updateField('phoneNumber', v)}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  maxLength={10}
                />
                {/* Validation checkmark */}
                <Animated.View style={checkStyle}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={colors.success}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Country picker dropdown */}
            {showCountryPicker && (
              <Animated.View style={styles.dropdown}>
                {COUNTRY_CODES.map(country => (
                  <Pressable
                    key={country.code}
                    onPress={() => {
                      updateField('countryCode', country.code);
                      setShowCountryPicker(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      country.code === form.countryCode && styles.dropdownItemActive,
                    ]}>
                    <Text style={styles.flagText}>{country.flag}</Text>
                    <Text style={styles.dropdownItemText}>{country.name}</Text>
                    <Text style={styles.dropdownItemCode}>{country.code}</Text>
                    {country.code === form.countryCode && (
                      <MaterialCommunityIcons name="check" size={14} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </Animated.View>
            )}
          </Animated.View>

          {/* Error box */}
          {displayError ? (
            <Animated.View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{displayError}</Text>
            </Animated.View>
          ) : null}

          {/* Submit button */}
          <AnimatedPressable
            onPress={handleSendOtp}
            onPressIn={handleBtnPressIn}
            onPressOut={handleBtnPressOut}
            disabled={loading}
            style={[styles.submitBtn, btnStyle, loading && styles.submitBtnLoading]}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ShimmerBox style={styles.shimmerInBtn} />
                <Text style={styles.submitBtnText}>Sending OTP…</Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={16} color={colors.white} />
                <Text style={styles.submitBtnText}>Send OTP</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="rgba(255,255,255,0.7)" />
              </>
            )}
          </AnimatedPressable>

          {/* Info strip */}
          <View style={styles.infoStrip}>
            <MaterialCommunityIcons name="information-outline" size={12} color={colors.textSoft} />
            <Text style={styles.infoText}>OTP valid for 60 seconds · Standard rates apply</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={styles.footer}>
          <Pressable
            onPress={() => navigation.navigate('PhoneLoginHelp')}
            hitSlop={8}>
            <Text style={styles.helpLink}>
              Having trouble?{' '}
              <Text style={styles.helpLinkBold}>Contact Admin</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background},
  flex: {
    flex: 1},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: 600},
  // Background blobs
  bgBlob1: {
    backgroundColor: colors.primarySoft,
    borderRadius: 180,
    height: 360,
    opacity: 0.55,
    position: 'absolute',
    right: -100,
    top: -80,
    width: 360},
  bgBlob2: {
    backgroundColor: colors.secondarySoft,
    borderRadius: 130,
    bottom: -50,
    height: 260,
    left: -70,
    opacity: 0.45,
    position: 'absolute',
    width: 260},
  bgBlob3: {
    backgroundColor: colors.accentSoft,
    borderRadius: 80,
    height: 160,
    left: '30%',
    opacity: 0.3,
    position: 'absolute',
    top: '55%',
    width: 160},
  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl},
  logoRing: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 2,
    height: 88,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 88},
  logoInner: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64},
  ringDot: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 10,
    position: 'absolute',
    width: 10},
  ringDotSmall: {
    height: 6,
    width: 6,
    backgroundColor: colors.secondary},
  brandName: {
    ...typography.title,
    color: colors.primary,
    letterSpacing: -0.5,
    textAlign: 'center'},
  brandTagline: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center'},
  badge: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4},
  badgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700'},
  // Card
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.xl,
    overflow: 'visible',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl},
  cardAccentBar: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 3,
    marginBottom: spacing.lg,
    width: 48},
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs},
  cardSub: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xl},
  // Inputs
  inputLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.5},
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs},
  codeBtn: {
    ...shadows.clayInset,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    width: 90},
  flagText: {
    fontSize: 18},
  codeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'},
  phoneInput: {
    ...shadows.clayInset,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: spacing.md},
  inputFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2},
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft},
  inputSuccess: {
    borderColor: colors.success},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5},
  // Dropdown
  dropdown: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden'},
  dropdownItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12},
  dropdownItemActive: {
    backgroundColor: colors.primaryFaint},
  dropdownItemText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600'},
  dropdownItemCode: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500'},
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
  // Button
  submitBtn: {
    ...shadows.fab,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 54,
    justifyContent: 'center',
    marginTop: spacing.md},
  submitBtnLoading: {
    opacity: 0.85},
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3},
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    overflow: 'hidden'},
  // Shimmer
  shimmerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    height: 16,
    overflow: 'hidden',
    width: 80},
  shimmerHighlight: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: '100%',
    width: 60},
  shimmerInBtn: {
    width: 40,
    height: 14},
  // Info
  infoStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: spacing.md},
  infoText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500'},
  // Footer
  footer: {
    alignItems: 'center'},
  helpLink: {
    ...typography.caption,
    color: colors.textMuted},
  helpLinkBold: {
    ...typography.captionBold,
    color: colors.primary}});

export default LoginScreen;
