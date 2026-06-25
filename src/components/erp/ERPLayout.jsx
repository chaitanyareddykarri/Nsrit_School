import React, {useState, useEffect, useMemo} from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';
import {USER_ROLES, ROLE_LABELS} from '../../config/constants';
import {logoutUser} from '../../store/slices/authSlice';

const {width: windowWidth} = Dimensions.get('window');
const isLargeScreen = windowWidth >= 768;

const getSidebarSectionsForRole = (role) => {
  if (role === USER_ROLES.MAIN_ADMIN) {
    return [
      {
        title: 'Dashboard',
        icon: 'view-dashboard',
        items: [{label: 'Overview', route: 'MainAdminTabs', icon: 'view-dashboard'}],
      },
      {
        title: 'Branch Management',
        icon: 'office-building',
        items: [
          {label: 'Branch List', route: 'BranchList', icon: 'office-building'},
          {label: 'Create Branch', route: 'CreateBranch', icon: 'office-building'},
        ],
      },
      {
        title: 'Users & Students',
        icon: 'account-group',
        items: [
          {label: 'Manage Users', route: 'ManageUsers', icon: 'account-group'},
          {label: 'Global Students', route: 'GlobalStudents', icon: 'school'},
        ],
      },
      {
        title: 'Academics',
        icon: 'book-open-variant',
        items: [{label: 'Global Classes', route: 'GlobalClasses', icon: 'book-open-variant'}],
      },
      {
        title: 'Analytics',
        icon: 'chart-line',
        items: [
          {label: 'Global Reports', route: 'GlobalAnalytics', icon: 'chart-line'},
          {label: 'Revenue Overview', route: 'RevenueOverview', icon: 'chart-line'},
        ],
      },
      {
        title: 'System',
        icon: 'cog',
        items: [
          {label: 'Audit Logs', route: 'AuditLogs', icon: 'clipboard-text-clock'},
          {label: 'Settings', route: 'Settings', icon: 'cog'},
        ],
      },
    ];
  }

  // Simplified structures for other roles
  switch (role) {
    case USER_ROLES.BRANCH_ADMIN:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'BranchAdminTabs', icon: 'view-dashboard'}],
        },
        {
          title: 'Students & Faculty',
          icon: 'account-group',
          items: [
            {label: 'Manage Students', route: 'ManageStudents', icon: 'account-group'},
            {label: 'Manage Teachers', route: 'ManageTeachers', icon: 'account-tie'},
          ],
        },
        {
          title: 'Operations',
          icon: 'cog',
          items: [
            {label: 'Attendance', route: 'AttendanceOverview', icon: 'clipboard-check'},
            {label: 'Fees Desk', route: 'FeeDashboard', icon: 'cash-multiple'},
          ],
        },
      ];
    case USER_ROLES.PRINCIPAL:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'PrincipalDashboard', icon: 'view-dashboard'}],
        },
        {
          title: 'Structure',
          icon: 'office-building',
          items: [{label: 'Academic Structure', route: 'AcademicStructure', icon: 'book-open-variant'}],
        },
        {
          title: 'Attendance & Fees',
          icon: 'chart-line',
          items: [
            {label: 'Attendance', route: 'ViewAllAttendance', icon: 'clipboard-check'},
            {label: 'Fees Desk', route: 'FeeDashboard', icon: 'cash-multiple'},
          ],
        },
      ];
    case USER_ROLES.COORDINATOR:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'CoordinatorTabs', icon: 'view-dashboard'}],
        },
        {
          title: 'Roster & Allocation',
          icon: 'account-group',
          items: [
            {label: 'Assign Teachers', route: 'AssignTeachers', icon: 'cog'},
            {label: 'Students List', route: 'WingStudents', icon: 'account-group'},
          ],
        },
        {
          title: 'Attendance Control',
          icon: 'clipboard-check',
          items: [{label: 'Wing Attendance', route: 'WingAttendance', icon: 'clipboard-check'}],
        },
      ];
    case USER_ROLES.TEACHER:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'TeacherDashboard', icon: 'view-dashboard'}],
        },
        {
          title: 'Roster',
          icon: 'account-group',
          items: [{label: 'Students List', route: 'StudentsList', icon: 'account-group'}],
        },
        {
          title: 'Attendance',
          icon: 'clipboard-check',
          items: [{label: 'Take Attendance', route: 'TakeAttendance', icon: 'clipboard-check'}],
        },
      ];
    case USER_ROLES.PARENT:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'ParentDashboard', icon: 'view-dashboard'}],
        },
        {
          title: 'Academic details',
          icon: 'book-open-variant',
          items: [
            {label: 'Attendance Sheet', route: 'Attendance', icon: 'clipboard-check'},
            {label: 'Child Selector', route: 'Students', icon: 'account-group'},
          ],
        },
      ];
    case USER_ROLES.ACCOUNTANT:
      return [
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          items: [{label: 'Overview', route: 'AccountantTabs', icon: 'view-dashboard'}],
        },
        {
          title: 'Finance Desk',
          icon: 'cash-multiple',
          items: [
            {label: 'Fees Desk', route: 'FeeDashboard', icon: 'cash-multiple'},
            {label: 'Due Reports', route: 'ClassWiseFeeReport', icon: 'chart-line'},
            {label: 'Payment History', route: 'PaymentHistory', icon: 'book-open-variant'},
          ],
        },
      ];
    default:
      return [];
  }
};

const getDashboardRouteForRole = (role) => {
  switch (role) {
    case USER_ROLES.MAIN_ADMIN: return 'MainAdminTabs';
    case USER_ROLES.BRANCH_ADMIN: return 'BranchAdminTabs';
    case USER_ROLES.PRINCIPAL: return 'PrincipalDashboard';
    case USER_ROLES.COORDINATOR: return 'CoordinatorTabs';
    case USER_ROLES.TEACHER: return 'TeacherDashboard';
    case USER_ROLES.PARENT: return 'ParentDashboard';
    case USER_ROLES.ACCOUNTANT: return 'AccountantTabs';
    default: return 'Login';
  }
};

export const ERPLayout = ({
  children,
  navigation,
  activeRoute = 'Dashboard',
  title = 'ERP System',
  breadcrumbs = [],
}) => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isLargeScreen);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Track open/collapsed state of sidebar sections
  const [openSections, setOpenSections] = useState({});

  const sections = useMemo(() => getSidebarSectionsForRole(role), [role]);
  const userInitials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  // Automatically expand all sections by default
  useEffect(() => {
    setOpenSections(prev => {
      const nextState = { ...prev };
      let hasChanges = false;
      sections.forEach(sec => {
        if (nextState[sec.title] !== true) {
          nextState[sec.title] = true;
          hasChanges = true;
        }
      });
      return hasChanges ? nextState : prev;
    });
  }, [sections]);

  const toggleSection = (title) => {
    setOpenSections(prev => ({...prev, [title]: !prev[title]}));
  };

  const handleNavigate = (route) => {
    if (!navigation) return;
    try {
      navigation.navigate(route);
    } catch (e) {
      console.warn(`ERPLayout: Navigation to ${route} failed`, e);
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await dispatch(logoutUser());
  };

  const defaultBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : ['Dashboard', title];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        
        {/* Sidebar Navigation - Expandable/Collapsible Sections */}
        {(!sidebarCollapsed || isLargeScreen) && (
          <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
            <View style={styles.sidebarHeader}>
              <MaterialCommunityIcons name="domain" size={20} color={colors.white} />
              {!sidebarCollapsed && <Text style={styles.sidebarBrand}>NSRIT ERP</Text>}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.menuContainer}>
              {sections.map((sec) => {
                const isExpanded = openSections[sec.title];
                return (
                  <View key={sec.title} style={styles.sectionBlock}>
                    {!sidebarCollapsed ? (
                      <Pressable onPress={() => toggleSection(sec.title)} style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <MaterialCommunityIcons name={sec.icon} size={24} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.sectionHeaderText}>{sec.title}</Text>
                        </View>
                        <MaterialCommunityIcons 
                          name={isExpanded ? 'chevron-down' : 'chevron-right'} 
                          size={14} 
                          color="rgba(255,255,255,0.4)" 
                        />
                      </Pressable>
                    ) : (
                      <View style={styles.dividerMini} />
                    )}

                    {(isExpanded || sidebarCollapsed) && sec.items.map((item) => {
                      const isActive = activeRoute.toLowerCase().includes(item.label.toLowerCase()) || 
                        (item.label === 'Overview' && activeRoute === 'Dashboard');
                      return (
                        <Pressable
                          key={item.label}
                          onPress={() => handleNavigate(item.route)}
                          style={[styles.menuItem, isActive && styles.menuItemActive]}>
                          <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={isActive ? colors.secondary : 'rgba(255,255,255,0.7)'}
                          />
                          {!sidebarCollapsed && (
                            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                              {item.label}
                            </Text>
                          )}
                          {isActive && <View style={styles.activeIndicator} />}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={styles.collapseToggle}>
              <MaterialCommunityIcons
                name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'}
                size={16}
                color={colors.white}
              />
            </Pressable>
          </View>
        )}

        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          
          {/* Header Row containing breadcrumbs, search, notifications, profile */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {!isLargeScreen && (
                <Pressable
                  onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={styles.headerIconBtn}>
                  <MaterialCommunityIcons name="cog" size={20} color={colors.primary} />
                </Pressable>
              )}
              <View style={styles.titleAndBreadcrumb}>
                <Text style={styles.headerTitle}>Admin Console</Text>
                <View style={styles.roleBadgeContainer}>
                  <Text style={styles.roleBadgeText}>{ROLE_LABELS[role] || 'Member'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.searchBarContainer}>
                <MaterialCommunityIcons name="magnify" size={16} color={colors.textSoft} style={styles.searchBarIcon} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Pressable style={styles.headerIconBtn}>
                <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />
                <View style={styles.notificationDot} />
              </Pressable>

              <Pressable
                onPress={() => setShowProfileMenu(!showProfileMenu)}
                style={styles.profileBtn}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Profile Dropdown Drawer */}
          {showProfileMenu && (
            <View style={styles.profileDropdown}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileDropdownName} numberOfLines={1}>{user?.fullName || 'NSRIT User'}</Text>
                <Text style={styles.profileDropdownRole}>{ROLE_LABELS[role] || 'Member'} ✓</Text>
              </View>
              <Pressable
                onPress={() => {
                  setShowProfileMenu(false);
                  handleNavigate(role === USER_ROLES.PARENT ? 'Profile' : 'Settings');
                }}
                style={styles.profileDropdownItem}>
                <MaterialCommunityIcons name="cog" size={16} color={colors.text} />
                <Text style={styles.profileDropdownText}>Settings</Text>
              </Pressable>
              <View style={styles.divider} />
              <Pressable onPress={handleLogout} style={styles.profileDropdownItem}>
                <MaterialCommunityIcons name="shield-account" size={16} color={colors.danger} />
                <Text style={[styles.profileDropdownText, {color: colors.danger}]}>
                  Logout
                </Text>
              </Pressable>
            </View>
          )}

          {/* Inner Content */}
          <View style={styles.innerContent}>{children}</View>


        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    backgroundColor: colors.primary,
    width: 210,
    height: '100%',
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  sidebarCollapsed: {
    width: 60,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  sidebarBrand: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  menuContainer: {
    flex: 1,
  },
  sectionBlock: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    marginBottom: 2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dividerMini: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.secondary,
  },
  collapseToggle: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    padding: spacing.xxs,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    height: 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    ...shadows.clayInset,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  titleAndBreadcrumb: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  roleBadgeContainer: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  profileMeta: {
    flexDirection: 'column',
  },
  profileName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },
  profileRole: {
    fontSize: 9,
    color: colors.textSoft,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBtn: {
    padding: spacing.xxs,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  profileDropdown: {
    position: 'absolute',
    top: 48,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    width: 170,
    padding: spacing.sm,
    ...shadows.clay,
    zIndex: 100,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  profileDropdownName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  profileDropdownRole: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  profileDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  profileDropdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xxs,
  },
  innerContent: {
    flex: 1,
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xs,
    height: 36,
    width: 180,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchBarIcon: {
    marginRight: spacing.xxs,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    padding: 0,
    fontWeight: '600',
  },
});

export default ERPLayout;
