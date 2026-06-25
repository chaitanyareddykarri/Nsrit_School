import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQueryClient} from '@tanstack/react-query';
import noticesService from '../../services/notices/noticesService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CATEGORIES = ['Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];

const CATEGORY_META = {
  Academic: {color: colors.primary, icon: 'school-outline'},
  Fee: {color: colors.secondary, icon: 'cash-multiple'},
  Holiday: {color: colors.success, icon: 'calendar-star'},
  Event: {color: colors.purple, icon: 'party-popper'},
  Urgent: {color: colors.danger, icon: 'alert-circle-outline'}};

const PostNoticeScreen = ({navigation, route}) => {
  const {user} = useSelector(state => state.auth);
  const branchId = route?.params?.branchId || user?.branchId;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Academic');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim()) {errs.title = 'Title is required';}
    if (!body.trim()) {errs.body = 'Notice content is required';}
    if (body.trim().length < 10) {errs.body = 'Content must be at least 10 characters';}
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePost = async () => {
    if (!validate()) {return;}
    setLoading(true);
    try {
      await noticesService.createNotice({
        title: title.trim(),
        body: body.trim(),
        category,
        branchId,
        author: user?.fullName || 'School Administration',
        authorId: user?.id,
        pinned});
      queryClient.invalidateQueries({queryKey: ['principalNotices']});
      queryClient.invalidateQueries({queryKey: ['parentNotices']});
      Alert.alert(
        'Notice Posted',
        'Your notice has been published successfully.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (err) {
      Alert.alert('Failed', err?.message || 'Could not post notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const meta = CATEGORY_META[category] || CATEGORY_META.Academic;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <Animated.View style={styles.hero}>
          <View style={styles.heroDecor} />
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="bulletin-board" size={28} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.heroTitle}>Post a Notice</Text>
          <Text style={styles.heroSub}>This will be visible to all parents and staff</Text>
        </Animated.View>

        {/* Category picker */}
        <Animated.View style={styles.card}>
          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}>
            {CATEGORIES.map(cat => {
              const catMeta = CATEGORY_META[cat];
              const isSelected = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    isSelected && {backgroundColor: `${catMeta.color}18`, borderColor: catMeta.color},
                  ]}>
                  <MaterialCommunityIcons
                    name={catMeta.icon}
                    size={14}
                    color={isSelected ? catMeta.color : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      isSelected && {color: catMeta.color, fontWeight: '800'},
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Title */}
        <Animated.View style={styles.card}>
          <Text style={styles.fieldLabel}>Notice Title *</Text>
          <View style={[styles.inputWrap, errors.title && styles.inputError]}>
            <MaterialCommunityIcons
              name="format-title"
              size={18}
              color={errors.title ? colors.danger : colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={v => {setTitle(v); if (errors.title) {setErrors(e => ({...e, title: null}));} }}
              placeholder="Enter a clear, concise title"
              placeholderTextColor={colors.textSoft}
              maxLength={120}
            />
          </View>
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          <Text style={styles.charCount}>{title.length}/120</Text>
        </Animated.View>

        {/* Body */}
        <Animated.View style={styles.card}>
          <Text style={styles.fieldLabel}>Notice Content *</Text>
          <View style={[styles.textAreaWrap, errors.body && styles.inputError]}>
            <TextInput
              style={styles.textArea}
              value={body}
              onChangeText={v => {setBody(v); if (errors.body) {setErrors(e => ({...e, body: null}));} }}
              placeholder="Write the full notice here. Be clear and specific about dates, actions needed, and who it applies to."
              placeholderTextColor={colors.textSoft}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>
          {errors.body ? <Text style={styles.errorText}>{errors.body}</Text> : null}
          <Text style={styles.charCount}>{body.length}/2000</Text>
        </Animated.View>

        {/* Options */}
        <Animated.View style={styles.card}>
          <Text style={styles.fieldLabel}>Options</Text>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="pin-outline" size={18} color={colors.danger} />
              <View>
                <Text style={styles.optionLabel}>Pin this notice</Text>
                <Text style={styles.optionDesc}>Pinned notices appear at the top</Text>
              </View>
            </View>
            <Switch
              value={pinned}
              onValueChange={setPinned}
              trackColor={{false: colors.border, true: `${colors.danger}60`}}
              thumbColor={pinned ? colors.danger : colors.textSoft}
            />
          </View>
        </Animated.View>

        {/* Preview chip */}
        <Animated.View style={styles.preview}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={[styles.previewChip, {backgroundColor: `${meta.color}15`}]}>
            <MaterialCommunityIcons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.previewCat, {color: meta.color}]}>{category}</Text>
            {pinned ? (
              <View style={styles.previewPin}>
                <MaterialCommunityIcons name="pin" size={10} color={colors.white} />
                <Text style={styles.previewPinText}>PINNED</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.previewTitle} numberOfLines={2}>{title || 'Your notice title will appear here'}</Text>
        </Animated.View>

        {/* Submit */}
        <Pressable
          onPress={handlePost}
          disabled={loading}
          style={({pressed}) => [styles.submitBtn, pressed && {opacity: 0.85}, loading && {opacity: 0.65}]}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="send-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>Post Notice</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.7}]}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},

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
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 52},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '900'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  fieldLabel: {color: colors.textSoft, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase'},

  catRow: {gap: spacing.sm},
  catChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7},
  catChipText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},

  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  inputError: {borderColor: colors.danger},
  inputIcon: {},
  input: {color: colors.text, flex: 1, fontSize: 14, paddingVertical: 10},
  textAreaWrap: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md},
  textArea: {color: colors.text, fontSize: 14, lineHeight: 22, minHeight: 100},
  errorText: {color: colors.danger, fontSize: 11, marginTop: 4},
  charCount: {color: colors.textSoft, fontSize: 10, marginTop: 4, textAlign: 'right'},

  optionRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  optionLeft: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md},
  optionLabel: {color: colors.text, fontSize: 14, fontWeight: '700'},
  optionDesc: {color: colors.textMuted, fontSize: 11, marginTop: 1},

  preview: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.clay},
  previewLabel: {color: colors.textSoft, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase'},
  previewChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3},
  previewCat: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},
  previewPin: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2},
  previewPinText: {color: colors.white, fontSize: 8, fontWeight: '900'},
  previewTitle: {color: colors.text, fontSize: 15, fontWeight: '700'},

  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: 15,
    ...shadows.fab},
  submitText: {color: colors.white, fontSize: 15, fontWeight: '800'},
  cancelBtn: {alignItems: 'center', paddingVertical: 12},
  cancelText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'}});

export default PostNoticeScreen;
