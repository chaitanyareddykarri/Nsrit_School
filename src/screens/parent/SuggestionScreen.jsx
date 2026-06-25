import React, {useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ConfirmationModal} from '../../components';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STATUS_META = {
  Pending: {color: colors.warning, icon: 'clock-outline', bg: colors.warningSoft},
  Reviewed: {color: colors.info, icon: 'eye-check-outline', bg: colors.infoSoft},
  Resolved: {color: colors.success, icon: 'check-circle-outline', bg: colors.successSoft}};

const MOCK_SUGGESTIONS = [
  {
    id: 's1',
    title: 'Improve Bus Route Coverage',
    body: 'Many students from the southern zone do not have bus coverage. Could the school consider adding a route for areas around Gajuwaka and Kommadi?',
    date: '2026-06-10',
    status: 'Reviewed',
    response: 'Thank you for your feedback. The transport committee is reviewing this request and will communicate the decision by June 20th.',
    respondedBy: 'Transport Department'},
  {
    id: 's2',
    title: 'Request for Extra Tuition Classes',
    body: 'My child is struggling with Mathematics in Grade IX. It would be great if the school could arrange extra classes or doubt-clearing sessions twice a week.',
    date: '2026-05-28',
    status: 'Resolved',
    response: 'We have introduced extra doubt-clearing sessions for Mathematics every Tuesday and Thursday from 4 PM. Please coordinate with the class teacher.',
    respondedBy: 'Academic Department'},
  {
    id: 's3',
    title: 'Better Canteen Menu Options',
    body: 'The canteen menu lacks healthy options for children. Could the school introduce more fruit-based snacks and reduce fried food offerings?',
    date: '2026-05-15',
    status: 'Pending',
    response: null,
    respondedBy: null},
];

const formatDate = dateStr => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'});
  } catch {
    return dateStr;
  }
};

const SuggestionCard = ({suggestion, index}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[suggestion.status] || STATUS_META.Pending;

  return (
    <Animated.View>
      <Pressable onPress={() => setExpanded(e => !e)} style={styles.suggCard}>
        {/* Header */}
        <View style={styles.suggTop}>
          <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
            <MaterialCommunityIcons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.statusText, {color: meta.color}]}>
              {suggestion.status}
            </Text>
          </View>
          <Text style={styles.suggDate}>{formatDate(suggestion.date)}</Text>
        </View>

        <Text style={styles.suggTitle}>{suggestion.title}</Text>
        <Text
          style={styles.suggBody}
          numberOfLines={expanded ? undefined : 2}>
          {suggestion.body}
        </Text>

        {/* Response thread */}
        {expanded && suggestion.response ? (
          <Animated.View
            style={styles.responseWrap}>
            <View style={styles.responseHeader}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={colors.secondary}
              />
              <Text style={styles.responseBy}>{suggestion.respondedBy}</Text>
            </View>
            <Text style={styles.responseText}>{suggestion.response}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.suggFooter}>
          <View style={styles.expandBtn}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.expandText}>
              {expanded
                ? 'Collapse'
                : suggestion.response
                ? 'View Response'
                : 'Read more'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const SuggestionScreen = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);

  const btnScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({transform: [{scale: btnScale.value}]}));

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {return;}
    setConfirmVisible(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmVisible(false);
    btnScale.value = withSpring(0.95, {}, () => {
      btnScale.value = withSpring(1);
    });
    const newSugg = {
      id: `s${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      date: toISODate(),
      status: 'Pending',
      response: null,
      respondedBy: null};
    setSuggestions(prev => [newSugg, ...prev]);
    setTitle('');
    setBody('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={suggestions}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <View style={styles.headerRow}>
                <View style={styles.headerIcon}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={20}
                    color={colors.white}
                  />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Suggestions</Text>
                  <Text style={styles.headerSub}>Share feedback with school management</Text>
                </View>
              </View>
            </Animated.View>

            {/* ── Compose card ── */}
            <Animated.View
              style={styles.composeCard}>
              <Text style={styles.composeLabel}>New Suggestion</Text>

              {submitted ? (
                <View style={styles.successBanner}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={16}
                    color={colors.success}
                  />
                  <Text style={styles.successText}>
                    Suggestion submitted successfully!
                  </Text>
                </View>
              ) : null}

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Brief title for your suggestion…"
                  placeholderTextColor={colors.textSoft}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Details</Text>
                <TextInput
                  style={styles.bodyInput}
                  placeholder="Describe your suggestion in detail…"
                  placeholderTextColor={colors.textSoft}
                  value={body}
                  onChangeText={setBody}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.charCount}>{body.length}/500</Text>
              </View>

              <AnimatedPressable
                onPress={handleSubmit}
                disabled={!title.trim() || !body.trim()}
                style={[
                  btnAnimStyle,
                  styles.submitBtn,
                  (!title.trim() || !body.trim()) && styles.submitBtnDisabled,
                ]}>
                <MaterialCommunityIcons
                  name="send-outline"
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.submitBtnText}>Submit Suggestion</Text>
              </AnimatedPressable>
            </Animated.View>

            {suggestions.length > 0 ? (
              <Text style={styles.sectionLabel}>Your Submissions</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <SuggestionCard suggestion={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons
              name="message-outline"
              size={40}
              color={colors.textSoft}
            />
            <Text style={styles.emptyTitle}>No suggestions yet</Text>
            <Text style={styles.emptySub}>
              Use the form above to share your ideas with the school.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
      <ConfirmationModal
        visible={confirmVisible}
        title="Submit Suggestion?"
        message={`Submit your suggestion "${title.trim()}" to the school?`}
        confirmLabel="Yes, Submit"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42},
  headerTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2},

  // Compose
  composeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.clay},
  composeLabel: {
    ...typography.sectionTitle,
    color: colors.textMuted,
    marginBottom: spacing.md},
  successBanner: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  successText: {color: colors.success, fontSize: 13, fontWeight: '600'},
  inputWrap: {marginBottom: spacing.md},
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'},
  titleInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2},
  bodyInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    height: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2},
  charCount: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    justifyContent: 'center',
    ...shadows.fab},
  submitBtnDisabled: {backgroundColor: colors.border},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  // Suggestion card
  suggCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  suggTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm},
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  statusText: {fontSize: 10, fontWeight: '800'},
  suggDate: {...typography.caption, color: colors.textMuted},
  suggTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs},
  suggBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm},
  responseWrap: {
    backgroundColor: `${colors.secondary}0E`,
    borderColor: `${colors.secondary}30`,
    borderLeftColor: colors.secondary,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    padding: spacing.md},
  responseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.xs},
  responseBy: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'},
  responseText: {color: colors.text, fontSize: 13, lineHeight: 19},
  suggFooter: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    paddingTop: spacing.sm},
  expandBtn: {alignItems: 'center', flexDirection: 'row', gap: 3},
  expandText: {color: colors.primary, fontSize: 11, fontWeight: '700'},

  // Empty
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl},
  emptyTitle: {...typography.bodyBold, color: colors.textMuted, marginTop: spacing.md},
  emptySub: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'center'}});

export default SuggestionScreen;
