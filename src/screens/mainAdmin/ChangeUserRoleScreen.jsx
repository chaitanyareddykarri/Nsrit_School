import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {useMutation} from '@tanstack/react-query';
import {ConfirmationModal} from '../../components';
import dataConnectClient from '../../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../../services/dataconnect/operations';
import {USER_ROLE_PRIORITY} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ROLE_META = {
  PRINCIPAL:     {label: 'Principal',     icon: 'school',                  color: colors.primary},
  BRANCH_ADMIN:  {label: 'Branch Admin',  icon: 'shield-account',          color: colors.secondary},
  COORDINATOR:   {label: 'Coordinator',   icon: 'account-tie',             color: colors.info},
  TEACHER:       {label: 'Teacher',       icon: 'human-male-board',        color: colors.success},
  CLASS_TEACHER: {label: 'Class Teacher', icon: 'human-male-board',        color: colors.success},
  ACCOUNTANT:    {label: 'Accountant',    icon: 'calculator-variant',      color: colors.warning},
  PARENT:        {label: 'Parent',        icon: 'human-male-female-child', color: colors.danger}};

const ASSIGNABLE_ROLES = Object.keys(ROLE_META);

// Returns the highest-priority role from the selected set.
const primaryFromSelected = selected =>
  USER_ROLE_PRIORITY.find(r => selected.includes(r)) || selected[0] || null;

const RoleBadge = ({role}) => {
  const meta = ROLE_META[role] || {};
  const c = meta.color || colors.textMuted;
  return (
    <View style={[styles.badge, {backgroundColor: `${c}18`}]}>
      <View style={[styles.badgeDot, {backgroundColor: c}]} />
      <Text style={[styles.badgeText, {color: c}]}>{role}</Text>
    </View>
  );
};

const ChangeUserRoleScreen = () => {
  const [phone, setPhone] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleSearch = async () => {
    const digits = phone.trim().replace(/^\+?91/, '').replace(/\D/g, '');
    if (digits.length !== 10) {
      setSearchError('Enter a valid 10-digit phone number.');
      return;
    }
    const phoneNumber = `+91${digits}`;
    setSearchError('');
    setFoundUser(null);
    setSelectedRoles([]);
    setSearching(true);
    try {
      const resp = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_USER_FOR_ROLE_CHANGE,
        {phoneNumber},
      );
      const user = (resp?.users || [])[0] || null;
      if (!user) {
        setSearchError('No active user found with this phone number.');
      } else {
        setFoundUser(user);
        // Pre-select exactly what's in the DB right now.
        const current = (user.userRoles_on_user || []).map(r => r.role);
        setSelectedRoles(current.length > 0 ? current : user.role ? [user.role] : []);
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const toggleRole = role => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  };

  const primaryRole = primaryFromSelected(selectedRoles);
  const additionalRoles = selectedRoles.filter(r => r !== primaryRole);

  const saveMutation = useMutation({
    mutationFn: async ({userId, primary, additional}) => {
      // Step 1: set primary role (cleans all existing user_roles + re-adds primary)
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CHANGE_USER_PRIMARY_ROLE, {
        userId,
        newRole: primary});
      // Step 2: add each additional role one by one
      for (const role of additional) {
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ADD_ADDITIONAL_ROLE, {
          userId,
          role});
      }
    },
    onSuccess: () => {
      const roleList = [primaryRole, ...additionalRoles].join(' + ');
      Toast.show({
        type: 'success',
        text1: 'Roles Updated',
        text2: `${foundUser?.fullName} → ${roleList}`});
      // Refresh display
      setFoundUser(prev =>
        prev ? {
          ...prev,
          role: primaryRole,
          userRoles_on_user: selectedRoles.map(r => ({id: r, role: r, createdAt: new Date().toISOString()}))} : null,
      );
    },
    onError: err => {
      Toast.show({type: 'error', text1: 'Update Failed', text2: err.message || 'Could not update roles.'});
    }});

  const currentRolesInDb = (foundUser?.userRoles_on_user || []).map(r => r.role).sort();
  const newRoles = [...selectedRoles].sort();
  const hasChanged =
    foundUser &&
    selectedRoles.length > 0 &&
    JSON.stringify(currentRolesInDb) !== JSON.stringify(newRoles);

  const handleApply = () => {
    if (!foundUser || !primaryRole || !hasChanged) {return;}
    setConfirmVisible(true);
  };

  const handleConfirmApply = () => {
    setConfirmVisible(false);
    saveMutation.mutate({
      userId: foundUser.id,
      primary: primaryRole,
      additional: additionalRoles});
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="shield-edit-outline" size={28} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>Change User Role</Text>
        <Text style={styles.heroSub}>Multi-role supported — e.g. Teacher + Parent</Text>
      </Animated.View>

      {/* Warning */}
      <Animated.View style={styles.warning}>
        <MaterialCommunityIcons name="alert-outline" size={15} color={colors.warning} />
        <Text style={styles.warningText}>
          Select one or more roles. The highest-priority role becomes the primary
          (used for dashboard routing). The user can switch between all assigned
          roles after login.
        </Text>
      </Animated.View>

      {/* Search */}
      <Animated.View style={styles.card}>
        <Text style={styles.sectionLabel}>Search by Phone Number</Text>
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="10-digit phone (e.g. 9100046512)"
              placeholderTextColor={colors.textSoft}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <Pressable
            onPress={handleSearch}
            disabled={searching}
            style={({pressed}) => [styles.searchBtn, pressed && {opacity: 0.8}]}>
            {searching
              ? <ActivityIndicator size={16} color={colors.white} />
              : <MaterialCommunityIcons name="magnify" size={18} color={colors.white} />}
          </Pressable>
        </View>
        {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}
      </Animated.View>

      {/* User card */}
      {foundUser && (
        <Animated.View style={styles.card}>
          <Text style={styles.sectionLabel}>User Found</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {foundUser.fullName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{foundUser.fullName}</Text>
              <Text style={styles.userPhone}>{foundUser.phoneNumber}</Text>
              <Text style={styles.userBranch}>
                {foundUser.branch?.name || 'No branch'} · users.role: {foundUser.role}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.dbLabel}>
            user_roles table ({foundUser.userRoles_on_user?.length || 0} rows)
          </Text>
          {(foundUser.userRoles_on_user || []).length === 0
            ? <Text style={styles.emptyText}>No rows — will fall back to users.role</Text>
            : (foundUser.userRoles_on_user || []).map(row => (
              <View key={row.id} style={styles.roleRow}>
                <RoleBadge role={row.role} />
                <Text style={styles.roleDate}>
                  {new Date(row.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'})}
                </Text>
              </View>
            ))}
        </Animated.View>
      )}

      {/* Multi-select role picker */}
      {foundUser && (
        <Animated.View style={styles.card}>
          <View style={styles.pickerHeader}>
            <Text style={styles.sectionLabel}>Select Roles (multi-select)</Text>
            {selectedRoles.length > 0 && (
              <View style={styles.primaryPill}>
                <Text style={styles.primaryPillText}>Primary: {primaryRole}</Text>
              </View>
            )}
          </View>

          {ASSIGNABLE_ROLES.map(role => {
            const meta = ROLE_META[role];
            const selected = selectedRoles.includes(role);
            const isPrimary = role === primaryRole;
            return (
              <Pressable
                key={role}
                onPress={() => toggleRole(role)}
                style={({pressed}) => [
                  styles.roleOption,
                  selected && {backgroundColor: `${meta.color}10`, borderColor: meta.color},
                  pressed && {opacity: 0.8},
                ]}>
                <View style={[styles.roleOptionIcon, {backgroundColor: `${meta.color}18`}]}>
                  <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
                </View>
                <View style={styles.roleOptionCopy}>
                  <Text style={[styles.roleOptionLabel, selected && {color: meta.color, fontWeight: '700'}]}>
                    {meta.label}
                  </Text>
                  {isPrimary && selected && (
                    <Text style={[styles.roleOptionSub, {color: meta.color}]}>Primary role</Text>
                  )}
                </View>
                <View style={[
                  styles.checkbox,
                  selected && {backgroundColor: meta.color, borderColor: meta.color},
                ]}>
                  {selected && (
                    <MaterialCommunityIcons name="check" size={13} color={colors.white} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Summary + Apply */}
      {foundUser && selectedRoles.length > 0 && (
        <Animated.View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Will be assigned</Text>
          <View style={styles.summaryBadges}>
            {selectedRoles.map(r => <RoleBadge key={r} role={r} />)}
          </View>
          {additionalRoles.length > 0 && (
            <Text style={styles.summaryNote}>
              Primary: {primaryRole} · After login, user can switch to: {additionalRoles.join(', ')}
            </Text>
          )}
        </Animated.View>
      )}

      {foundUser && (
        <Animated.View>
          <Pressable
            onPress={handleApply}
            disabled={!hasChanged || saveMutation.isPending}
            style={({pressed}) => [
              styles.applyBtn,
              (!hasChanged || saveMutation.isPending) && styles.applyBtnDisabled,
              pressed && {opacity: 0.85},
            ]}>
            {saveMutation.isPending
              ? <ActivityIndicator size={18} color={colors.white} />
              : <MaterialCommunityIcons name="check-bold" size={18} color={colors.white} />}
            <Text style={styles.applyBtnText}>
              {saveMutation.isPending
                ? 'Applying…'
                : hasChanged
                  ? `Apply (${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''})`
                  : 'No changes'}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Change User Role?"
        message={`Set ${foundUser?.fullName || 'this user'}'s role to ${additionalRoles.length > 0 ? `${primaryRole} + ${additionalRoles.join(' + ')}` : primaryRole}?`}
        confirmLabel="Yes, Apply"
        cancelLabel="Cancel"
        onConfirm={handleConfirmApply}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 52},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500'},

  warning: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md},
  warningText: {color: colors.warning, flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18},

  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg},
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    textTransform: 'uppercase'},

  searchRow: {flexDirection: 'row', gap: spacing.sm},
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md},
  input: {...typography.body, color: colors.text, flex: 1},
  searchBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.fab},
  errorText: {color: colors.danger, fontSize: 12, fontWeight: '500', marginTop: spacing.sm},

  userRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48},
  avatarText: {color: colors.primary, fontSize: 20, fontWeight: '900'},
  userInfo: {flex: 1},
  userName: {...typography.bodyBold, color: colors.text},
  userPhone: {color: colors.textMuted, fontSize: 12, marginTop: 2},
  userBranch: {color: colors.textSoft, fontSize: 11, marginTop: 1},
  divider: {backgroundColor: colors.borderLight, height: 1, marginVertical: spacing.sm},
  dbLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 4},
  roleRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 6},
  roleDate: {color: colors.textMuted, fontSize: 11},
  emptyText: {color: colors.textSoft, fontSize: 12, fontStyle: 'italic'},

  badge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  badgeDot: {borderRadius: 4, height: 7, width: 7},
  badgeText: {fontSize: 11, fontWeight: '700'},

  pickerHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  primaryPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  primaryPillText: {color: colors.primary, fontSize: 10, fontWeight: '700'},

  roleOption: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md},
  roleOptionIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36},
  roleOptionCopy: {flex: 1},
  roleOptionLabel: {...typography.body, color: colors.text},
  roleOptionSub: {fontSize: 10, fontWeight: '600', marginTop: 1},
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 5,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22},

  summaryCard: {
    ...shadows.clay,
    backgroundColor: colors.primarySoft,
    borderColor: `${colors.primary}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg},
  summaryLabel: {color: colors.primary, fontSize: 10, fontWeight: '700', marginBottom: spacing.sm, textTransform: 'uppercase'},
  summaryBadges: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm},
  summaryNote: {color: colors.primary, fontSize: 11, fontWeight: '500', lineHeight: 16},

  applyBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.fab},
  applyBtnDisabled: {backgroundColor: colors.border},
  applyBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'}});

export default ChangeUserRoleScreen;
