const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'nsrit',
  service: 'nsrit-school-2b749-service',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const createBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBranch', inputVars);
}
createBranchRef.operationName = 'CreateBranch';
exports.createBranchRef = createBranchRef;

exports.createBranch = function createBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createBranchRef(dcInstance, inputVars));
}
;

const updateBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateBranch', inputVars);
}
updateBranchRef.operationName = 'UpdateBranch';
exports.updateBranchRef = updateBranchRef;

exports.updateBranch = function updateBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateBranchRef(dcInstance, inputVars));
}
;

const assignBranchAdminRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignBranchAdmin', inputVars);
}
assignBranchAdminRef.operationName = 'AssignBranchAdmin';
exports.assignBranchAdminRef = assignBranchAdminRef;

exports.assignBranchAdmin = function assignBranchAdmin(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignBranchAdminRef(dcInstance, inputVars));
}
;

const assignPrincipalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignPrincipal', inputVars);
}
assignPrincipalRef.operationName = 'AssignPrincipal';
exports.assignPrincipalRef = assignPrincipalRef;

exports.assignPrincipal = function assignPrincipal(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignPrincipalRef(dcInstance, inputVars));
}
;

const createClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClass', inputVars);
}
createClassRef.operationName = 'CreateClass';
exports.createClassRef = createClassRef;

exports.createClass = function createClass(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createClassRef(dcInstance, inputVars));
}
;

const activateClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ActivateClass', inputVars);
}
activateClassRef.operationName = 'ActivateClass';
exports.activateClassRef = activateClassRef;

exports.activateClass = function activateClass(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(activateClassRef(dcInstance, inputVars));
}
;

const deactivateClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeactivateClass', inputVars);
}
deactivateClassRef.operationName = 'DeactivateClass';
exports.deactivateClassRef = deactivateClassRef;

exports.deactivateClass = function deactivateClass(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deactivateClassRef(dcInstance, inputVars));
}
;

const seedAcademicClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedAcademicClass', inputVars);
}
seedAcademicClassRef.operationName = 'SeedAcademicClass';
exports.seedAcademicClassRef = seedAcademicClassRef;

exports.seedAcademicClass = function seedAcademicClass(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(seedAcademicClassRef(dcInstance, inputVars));
}
;

const createWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWing', inputVars);
}
createWingRef.operationName = 'CreateWing';
exports.createWingRef = createWingRef;

exports.createWing = function createWing(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createWingRef(dcInstance, inputVars));
}
;

const createSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSection', inputVars);
}
createSectionRef.operationName = 'CreateSection';
exports.createSectionRef = createSectionRef;

exports.createSection = function createSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSectionRef(dcInstance, inputVars));
}
;

const removeSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveSection', inputVars);
}
removeSectionRef.operationName = 'RemoveSection';
exports.removeSectionRef = removeSectionRef;

exports.removeSection = function removeSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(removeSectionRef(dcInstance, inputVars));
}
;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserRef(dcInstance, inputVars));
}
;

const claimUserFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClaimUserFirebaseUID', inputVars);
}
claimUserFirebaseUidRef.operationName = 'ClaimUserFirebaseUID';
exports.claimUserFirebaseUidRef = claimUserFirebaseUidRef;

exports.claimUserFirebaseUid = function claimUserFirebaseUid(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(claimUserFirebaseUidRef(dcInstance, inputVars));
}
;

const ensureCurrentUserLegacyRoleRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'EnsureCurrentUserLegacyRole');
}
ensureCurrentUserLegacyRoleRef.operationName = 'EnsureCurrentUserLegacyRole';
exports.ensureCurrentUserLegacyRoleRef = ensureCurrentUserLegacyRoleRef;

exports.ensureCurrentUserLegacyRole = function ensureCurrentUserLegacyRole(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(ensureCurrentUserLegacyRoleRef(dcInstance, inputVars));
}
;

const addParentRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddParentRole', inputVars);
}
addParentRoleRef.operationName = 'AddParentRole';
exports.addParentRoleRef = addParentRoleRef;

exports.addParentRole = function addParentRole(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addParentRoleRef(dcInstance, inputVars));
}
;

const switchRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SwitchRole', inputVars);
}
switchRoleRef.operationName = 'SwitchRole';
exports.switchRoleRef = switchRoleRef;

exports.switchRole = function switchRole(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(switchRoleRef(dcInstance, inputVars));
}
;

const linkParentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkParentUser', inputVars);
}
linkParentUserRef.operationName = 'LinkParentUser';
exports.linkParentUserRef = linkParentUserRef;

exports.linkParentUser = function linkParentUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(linkParentUserRef(dcInstance, inputVars));
}
;

const linkStudentParentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkStudentParent', inputVars);
}
linkStudentParentRef.operationName = 'LinkStudentParent';
exports.linkStudentParentRef = linkStudentParentRef;

exports.linkStudentParent = function linkStudentParent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(linkStudentParentRef(dcInstance, inputVars));
}
;

const createParentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParent', inputVars);
}
createParentRef.operationName = 'CreateParent';
exports.createParentRef = createParentRef;

exports.createParent = function createParent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createParentRef(dcInstance, inputVars));
}
;

const createParentWithoutUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParentWithoutUser', inputVars);
}
createParentWithoutUserRef.operationName = 'CreateParentWithoutUser';
exports.createParentWithoutUserRef = createParentWithoutUserRef;

exports.createParentWithoutUser = function createParentWithoutUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createParentWithoutUserRef(dcInstance, inputVars));
}
;

const createStudentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateStudent', inputVars);
}
createStudentRef.operationName = 'CreateStudent';
exports.createStudentRef = createStudentRef;

exports.createStudent = function createStudent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createStudentRef(dcInstance, inputVars));
}
;

const updateStudentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateStudent', inputVars);
}
updateStudentRef.operationName = 'UpdateStudent';
exports.updateStudentRef = updateStudentRef;

exports.updateStudent = function updateStudent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateStudentRef(dcInstance, inputVars));
}
;

const createAttendanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAttendance', inputVars);
}
createAttendanceRef.operationName = 'CreateAttendance';
exports.createAttendanceRef = createAttendanceRef;

exports.createAttendance = function createAttendance(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAttendanceRef(dcInstance, inputVars));
}
;

const updateAttendanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAttendance', inputVars);
}
updateAttendanceRef.operationName = 'UpdateAttendance';
exports.updateAttendanceRef = updateAttendanceRef;

exports.updateAttendance = function updateAttendance(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAttendanceRef(dcInstance, inputVars));
}
;

const uploadFeePaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UploadFeePayment', inputVars);
}
uploadFeePaymentRef.operationName = 'UploadFeePayment';
exports.uploadFeePaymentRef = uploadFeePaymentRef;

exports.uploadFeePayment = function uploadFeePayment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(uploadFeePaymentRef(dcInstance, inputVars));
}
;

const assignTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignTeacher', inputVars);
}
assignTeacherRef.operationName = 'AssignTeacher';
exports.assignTeacherRef = assignTeacherRef;

exports.assignTeacher = function assignTeacher(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignTeacherRef(dcInstance, inputVars));
}
;

const createCoordinatorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCoordinator', inputVars);
}
createCoordinatorRef.operationName = 'CreateCoordinator';
exports.createCoordinatorRef = createCoordinatorRef;

exports.createCoordinator = function createCoordinator(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCoordinatorRef(dcInstance, inputVars));
}
;

const createTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeacher', inputVars);
}
createTeacherRef.operationName = 'CreateTeacher';
exports.createTeacherRef = createTeacherRef;

exports.createTeacher = function createTeacher(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createTeacherRef(dcInstance, inputVars));
}
;

const assignTeacherClassTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignTeacherClassTeacher', inputVars);
}
assignTeacherClassTeacherRef.operationName = 'AssignTeacherClassTeacher';
exports.assignTeacherClassTeacherRef = assignTeacherClassTeacherRef;

exports.assignTeacherClassTeacher = function assignTeacherClassTeacher(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignTeacherClassTeacherRef(dcInstance, inputVars));
}
;

const updateTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTeacher', inputVars);
}
updateTeacherRef.operationName = 'UpdateTeacher';
exports.updateTeacherRef = updateTeacherRef;

exports.updateTeacher = function updateTeacher(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTeacherRef(dcInstance, inputVars));
}
;

const assignClassTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignClassTeacher', inputVars);
}
assignClassTeacherRef.operationName = 'AssignClassTeacher';
exports.assignClassTeacherRef = assignClassTeacherRef;

exports.assignClassTeacher = function assignClassTeacher(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignClassTeacherRef(dcInstance, inputVars));
}
;

const createSubjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSubject', inputVars);
}
createSubjectRef.operationName = 'CreateSubject';
exports.createSubjectRef = createSubjectRef;

exports.createSubject = function createSubject(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSubjectRef(dcInstance, inputVars));
}
;

const assignTeacherSubjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignTeacherSubject', inputVars);
}
assignTeacherSubjectRef.operationName = 'AssignTeacherSubject';
exports.assignTeacherSubjectRef = assignTeacherSubjectRef;

exports.assignTeacherSubject = function assignTeacherSubject(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignTeacherSubjectRef(dcInstance, inputVars));
}
;

const clearTeacherSubjectsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClearTeacherSubjects', inputVars);
}
clearTeacherSubjectsRef.operationName = 'ClearTeacherSubjects';
exports.clearTeacherSubjectsRef = clearTeacherSubjectsRef;

exports.clearTeacherSubjects = function clearTeacherSubjects(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(clearTeacherSubjectsRef(dcInstance, inputVars));
}
;

const createAccountantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAccountant', inputVars);
}
createAccountantRef.operationName = 'CreateAccountant';
exports.createAccountantRef = createAccountantRef;

exports.createAccountant = function createAccountant(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAccountantRef(dcInstance, inputVars));
}
;

const clearTeacherWingRestrictionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClearTeacherWingRestrictions', inputVars);
}
clearTeacherWingRestrictionsRef.operationName = 'ClearTeacherWingRestrictions';
exports.clearTeacherWingRestrictionsRef = clearTeacherWingRestrictionsRef;

exports.clearTeacherWingRestrictions = function clearTeacherWingRestrictions(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(clearTeacherWingRestrictionsRef(dcInstance, inputVars));
}
;

const ensureCoordinatorTeacherProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'EnsureCoordinatorTeacherProfile', inputVars);
}
ensureCoordinatorTeacherProfileRef.operationName = 'EnsureCoordinatorTeacherProfile';
exports.ensureCoordinatorTeacherProfileRef = ensureCoordinatorTeacherProfileRef;

exports.ensureCoordinatorTeacherProfile = function ensureCoordinatorTeacherProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(ensureCoordinatorTeacherProfileRef(dcInstance, inputVars));
}
;

const updateClassTeacherAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateClassTeacherAssignment', inputVars);
}
updateClassTeacherAssignmentRef.operationName = 'UpdateClassTeacherAssignment';
exports.updateClassTeacherAssignmentRef = updateClassTeacherAssignmentRef;

exports.updateClassTeacherAssignment = function updateClassTeacherAssignment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateClassTeacherAssignmentRef(dcInstance, inputVars));
}
;

const removeClassTeacherAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveClassTeacherAssignment', inputVars);
}
removeClassTeacherAssignmentRef.operationName = 'RemoveClassTeacherAssignment';
exports.removeClassTeacherAssignmentRef = removeClassTeacherAssignmentRef;

exports.removeClassTeacherAssignment = function removeClassTeacherAssignment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(removeClassTeacherAssignmentRef(dcInstance, inputVars));
}
;

const removeLegacyClassTeacherAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveLegacyClassTeacherAssignment', inputVars);
}
removeLegacyClassTeacherAssignmentRef.operationName = 'RemoveLegacyClassTeacherAssignment';
exports.removeLegacyClassTeacherAssignmentRef = removeLegacyClassTeacherAssignmentRef;

exports.removeLegacyClassTeacherAssignment = function removeLegacyClassTeacherAssignment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(removeLegacyClassTeacherAssignmentRef(dcInstance, inputVars));
}
;

const updateAccountantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAccountant', inputVars);
}
updateAccountantRef.operationName = 'UpdateAccountant';
exports.updateAccountantRef = updateAccountantRef;

exports.updateAccountant = function updateAccountant(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAccountantRef(dcInstance, inputVars));
}
;

const createFeeCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFeeCategory', inputVars);
}
createFeeCategoryRef.operationName = 'CreateFeeCategory';
exports.createFeeCategoryRef = createFeeCategoryRef;

exports.createFeeCategory = function createFeeCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFeeCategoryRef(dcInstance, inputVars));
}
;

const updateFeeCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFeeCategory', inputVars);
}
updateFeeCategoryRef.operationName = 'UpdateFeeCategory';
exports.updateFeeCategoryRef = updateFeeCategoryRef;

exports.updateFeeCategory = function updateFeeCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFeeCategoryRef(dcInstance, inputVars));
}
;

const createClassFeeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClassFee', inputVars);
}
createClassFeeRef.operationName = 'CreateClassFee';
exports.createClassFeeRef = createClassFeeRef;

exports.createClassFee = function createClassFee(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createClassFeeRef(dcInstance, inputVars));
}
;

const updateClassFeeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateClassFee', inputVars);
}
updateClassFeeRef.operationName = 'UpdateClassFee';
exports.updateClassFeeRef = updateClassFeeRef;

exports.updateClassFee = function updateClassFee(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateClassFeeRef(dcInstance, inputVars));
}
;

const createFeePlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFeePlan', inputVars);
}
createFeePlanRef.operationName = 'CreateFeePlan';
exports.createFeePlanRef = createFeePlanRef;

exports.createFeePlan = function createFeePlan(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFeePlanRef(dcInstance, inputVars));
}
;

const updateFeePlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFeePlan', inputVars);
}
updateFeePlanRef.operationName = 'UpdateFeePlan';
exports.updateFeePlanRef = updateFeePlanRef;

exports.updateFeePlan = function updateFeePlan(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFeePlanRef(dcInstance, inputVars));
}
;

const clearFeePlanItemsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClearFeePlanItems', inputVars);
}
clearFeePlanItemsRef.operationName = 'ClearFeePlanItems';
exports.clearFeePlanItemsRef = clearFeePlanItemsRef;

exports.clearFeePlanItems = function clearFeePlanItems(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(clearFeePlanItemsRef(dcInstance, inputVars));
}
;

const createFeePlanItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFeePlanItem', inputVars);
}
createFeePlanItemRef.operationName = 'CreateFeePlanItem';
exports.createFeePlanItemRef = createFeePlanItemRef;

exports.createFeePlanItem = function createFeePlanItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFeePlanItemRef(dcInstance, inputVars));
}
;

const recordPaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordPayment', inputVars);
}
recordPaymentRef.operationName = 'RecordPayment';
exports.recordPaymentRef = recordPaymentRef;

exports.recordPayment = function recordPayment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(recordPaymentRef(dcInstance, inputVars));
}
;

const updatePaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePayment', inputVars);
}
updatePaymentRef.operationName = 'UpdatePayment';
exports.updatePaymentRef = updatePaymentRef;

exports.updatePayment = function updatePayment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePaymentRef(dcInstance, inputVars));
}
;

const reversePaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ReversePayment', inputVars);
}
reversePaymentRef.operationName = 'ReversePayment';
exports.reversePaymentRef = reversePaymentRef;

exports.reversePayment = function reversePayment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(reversePaymentRef(dcInstance, inputVars));
}
;

const recordAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordAuditLog', inputVars);
}
recordAuditLogRef.operationName = 'RecordAuditLog';
exports.recordAuditLogRef = recordAuditLogRef;

exports.recordAuditLog = function recordAuditLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(recordAuditLogRef(dcInstance, inputVars));
}
;

const createNoticeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNotice', inputVars);
}
createNoticeRef.operationName = 'CreateNotice';
exports.createNoticeRef = createNoticeRef;

exports.createNotice = function createNotice(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createNoticeRef(dcInstance, inputVars));
}
;

const updateNoticeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateNotice', inputVars);
}
updateNoticeRef.operationName = 'UpdateNotice';
exports.updateNoticeRef = updateNoticeRef;

exports.updateNotice = function updateNotice(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateNoticeRef(dcInstance, inputVars));
}
;

const deleteNoticeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteNotice', inputVars);
}
deleteNoticeRef.operationName = 'DeleteNotice';
exports.deleteNoticeRef = deleteNoticeRef;

exports.deleteNotice = function deleteNotice(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteNoticeRef(dcInstance, inputVars));
}
;

const toggleNoticePinRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ToggleNoticePin', inputVars);
}
toggleNoticePinRef.operationName = 'ToggleNoticePin';
exports.toggleNoticePinRef = toggleNoticePinRef;

exports.toggleNoticePin = function toggleNoticePin(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(toggleNoticePinRef(dcInstance, inputVars));
}
;

const upsertTimetablePeriodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertTimetablePeriod', inputVars);
}
upsertTimetablePeriodRef.operationName = 'UpsertTimetablePeriod';
exports.upsertTimetablePeriodRef = upsertTimetablePeriodRef;

exports.upsertTimetablePeriod = function upsertTimetablePeriod(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertTimetablePeriodRef(dcInstance, inputVars));
}
;

const clearTimetableForSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClearTimetableForSection', inputVars);
}
clearTimetableForSectionRef.operationName = 'ClearTimetableForSection';
exports.clearTimetableForSectionRef = clearTimetableForSectionRef;

exports.clearTimetableForSection = function clearTimetableForSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(clearTimetableForSectionRef(dcInstance, inputVars));
}
;

const upsertTimetablePeriodFullRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertTimetablePeriodFull', inputVars);
}
upsertTimetablePeriodFullRef.operationName = 'UpsertTimetablePeriodFull';
exports.upsertTimetablePeriodFullRef = upsertTimetablePeriodFullRef;

exports.upsertTimetablePeriodFull = function upsertTimetablePeriodFull(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertTimetablePeriodFullRef(dcInstance, inputVars));
}
;

const publishTimetableSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PublishTimetableSection', inputVars);
}
publishTimetableSectionRef.operationName = 'PublishTimetableSection';
exports.publishTimetableSectionRef = publishTimetableSectionRef;

exports.publishTimetableSection = function publishTimetableSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(publishTimetableSectionRef(dcInstance, inputVars));
}
;

const unpublishTimetableSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UnpublishTimetableSection', inputVars);
}
unpublishTimetableSectionRef.operationName = 'UnpublishTimetableSection';
exports.unpublishTimetableSectionRef = unpublishTimetableSectionRef;

exports.unpublishTimetableSection = function unpublishTimetableSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(unpublishTimetableSectionRef(dcInstance, inputVars));
}
;

const createSuggestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSuggestion', inputVars);
}
createSuggestionRef.operationName = 'CreateSuggestion';
exports.createSuggestionRef = createSuggestionRef;

exports.createSuggestion = function createSuggestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSuggestionRef(dcInstance, inputVars));
}
;

const respondToSuggestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RespondToSuggestion', inputVars);
}
respondToSuggestionRef.operationName = 'RespondToSuggestion';
exports.respondToSuggestionRef = respondToSuggestionRef;

exports.respondToSuggestion = function respondToSuggestion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(respondToSuggestionRef(dcInstance, inputVars));
}
;

const createNotificationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNotification', inputVars);
}
createNotificationRef.operationName = 'CreateNotification';
exports.createNotificationRef = createNotificationRef;

exports.createNotification = function createNotification(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createNotificationRef(dcInstance, inputVars));
}
;

const deleteNotificationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteNotification', inputVars);
}
deleteNotificationRef.operationName = 'DeleteNotification';
exports.deleteNotificationRef = deleteNotificationRef;

exports.deleteNotification = function deleteNotification(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteNotificationRef(dcInstance, inputVars));
}
;

const markNotificationReadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkNotificationRead', inputVars);
}
markNotificationReadRef.operationName = 'MarkNotificationRead';
exports.markNotificationReadRef = markNotificationReadRef;

exports.markNotificationRead = function markNotificationRead(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(markNotificationReadRef(dcInstance, inputVars));
}
;

const markAllNotificationsReadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkAllNotificationsRead', inputVars);
}
markAllNotificationsReadRef.operationName = 'MarkAllNotificationsRead';
exports.markAllNotificationsReadRef = markAllNotificationsReadRef;

exports.markAllNotificationsRead = function markAllNotificationsRead(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(markAllNotificationsReadRef(dcInstance, inputVars));
}
;

const changeUserPrimaryRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ChangeUserPrimaryRole', inputVars);
}
changeUserPrimaryRoleRef.operationName = 'ChangeUserPrimaryRole';
exports.changeUserPrimaryRoleRef = changeUserPrimaryRoleRef;

exports.changeUserPrimaryRole = function changeUserPrimaryRole(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(changeUserPrimaryRoleRef(dcInstance, inputVars));
}
;

const addAdditionalRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddAdditionalRole', inputVars);
}
addAdditionalRoleRef.operationName = 'AddAdditionalRole';
exports.addAdditionalRoleRef = addAdditionalRoleRef;

exports.addAdditionalRole = function addAdditionalRole(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addAdditionalRoleRef(dcInstance, inputVars));
}
;

const cleanUserRolesToPrimaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CleanUserRolesToPrimary', inputVars);
}
cleanUserRolesToPrimaryRef.operationName = 'CleanUserRolesToPrimary';
exports.cleanUserRolesToPrimaryRef = cleanUserRolesToPrimaryRef;

exports.cleanUserRolesToPrimary = function cleanUserRolesToPrimary(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(cleanUserRolesToPrimaryRef(dcInstance, inputVars));
}
;

const createAcademicYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAcademicYear', inputVars);
}
createAcademicYearRef.operationName = 'CreateAcademicYear';
exports.createAcademicYearRef = createAcademicYearRef;

exports.createAcademicYear = function createAcademicYear(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAcademicYearRef(dcInstance, inputVars));
}
;

const updateAcademicYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAcademicYear', inputVars);
}
updateAcademicYearRef.operationName = 'UpdateAcademicYear';
exports.updateAcademicYearRef = updateAcademicYearRef;

exports.updateAcademicYear = function updateAcademicYear(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateAcademicYearRef(dcInstance, inputVars));
}
;

const activateAcademicYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ActivateAcademicYear', inputVars);
}
activateAcademicYearRef.operationName = 'ActivateAcademicYear';
exports.activateAcademicYearRef = activateAcademicYearRef;

exports.activateAcademicYear = function activateAcademicYear(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(activateAcademicYearRef(dcInstance, inputVars));
}
;

const closeAcademicYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CloseAcademicYear', inputVars);
}
closeAcademicYearRef.operationName = 'CloseAcademicYear';
exports.closeAcademicYearRef = closeAcademicYearRef;

exports.closeAcademicYear = function closeAcademicYear(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(closeAcademicYearRef(dcInstance, inputVars));
}
;

const recordStudentPromotionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordStudentPromotion', inputVars);
}
recordStudentPromotionRef.operationName = 'RecordStudentPromotion';
exports.recordStudentPromotionRef = recordStudentPromotionRef;

exports.recordStudentPromotion = function recordStudentPromotion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(recordStudentPromotionRef(dcInstance, inputVars));
}
;

const applyStudentPromotionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ApplyStudentPromotion', inputVars);
}
applyStudentPromotionRef.operationName = 'ApplyStudentPromotion';
exports.applyStudentPromotionRef = applyStudentPromotionRef;

exports.applyStudentPromotion = function applyStudentPromotion(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(applyStudentPromotionRef(dcInstance, inputVars));
}
;

const createHolidayRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateHoliday', inputVars);
}
createHolidayRef.operationName = 'CreateHoliday';
exports.createHolidayRef = createHolidayRef;

exports.createHoliday = function createHoliday(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createHolidayRef(dcInstance, inputVars));
}
;

const updateHolidayRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateHoliday', inputVars);
}
updateHolidayRef.operationName = 'UpdateHoliday';
exports.updateHolidayRef = updateHolidayRef;

exports.updateHoliday = function updateHoliday(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateHolidayRef(dcInstance, inputVars));
}
;

const deleteHolidayRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteHoliday', inputVars);
}
deleteHolidayRef.operationName = 'DeleteHoliday';
exports.deleteHolidayRef = deleteHolidayRef;

exports.deleteHoliday = function deleteHoliday(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteHolidayRef(dcInstance, inputVars));
}
;

const correctAttendanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CorrectAttendance', inputVars);
}
correctAttendanceRef.operationName = 'CorrectAttendance';
exports.correctAttendanceRef = correctAttendanceRef;

exports.correctAttendance = function correctAttendance(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(correctAttendanceRef(dcInstance, inputVars));
}
;

const upsertAttendanceSummaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertAttendanceSummary', inputVars);
}
upsertAttendanceSummaryRef.operationName = 'UpsertAttendanceSummary';
exports.upsertAttendanceSummaryRef = upsertAttendanceSummaryRef;

exports.upsertAttendanceSummary = function upsertAttendanceSummary(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertAttendanceSummaryRef(dcInstance, inputVars));
}
;

const createAttendanceAlertLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAttendanceAlertLog', inputVars);
}
createAttendanceAlertLogRef.operationName = 'CreateAttendanceAlertLog';
exports.createAttendanceAlertLogRef = createAttendanceAlertLogRef;

exports.createAttendanceAlertLog = function createAttendanceAlertLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAttendanceAlertLogRef(dcInstance, inputVars));
}
;

const createPublicHolidayRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePublicHoliday', inputVars);
}
createPublicHolidayRef.operationName = 'CreatePublicHoliday';
exports.createPublicHolidayRef = createPublicHolidayRef;

exports.createPublicHoliday = function createPublicHoliday(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPublicHolidayRef(dcInstance, inputVars));
}
;

const createExamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateExam', inputVars);
}
createExamRef.operationName = 'CreateExam';
exports.createExamRef = createExamRef;

exports.createExam = function createExam(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createExamRef(dcInstance, inputVars));
}
;

const updateExamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateExam', inputVars);
}
updateExamRef.operationName = 'UpdateExam';
exports.updateExamRef = updateExamRef;

exports.updateExam = function updateExam(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateExamRef(dcInstance, inputVars));
}
;

const archiveExamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ArchiveExam', inputVars);
}
archiveExamRef.operationName = 'ArchiveExam';
exports.archiveExamRef = archiveExamRef;

exports.archiveExam = function archiveExam(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(archiveExamRef(dcInstance, inputVars));
}
;

const deleteExamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExam', inputVars);
}
deleteExamRef.operationName = 'DeleteExam';
exports.deleteExamRef = deleteExamRef;

exports.deleteExam = function deleteExam(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteExamRef(dcInstance, inputVars));
}
;

const addExamSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddExamSection', inputVars);
}
addExamSectionRef.operationName = 'AddExamSection';
exports.addExamSectionRef = addExamSectionRef;

exports.addExamSection = function addExamSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addExamSectionRef(dcInstance, inputVars));
}
;

const upsertExamSubjectConfigRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertExamSubjectConfig', inputVars);
}
upsertExamSubjectConfigRef.operationName = 'UpsertExamSubjectConfig';
exports.upsertExamSubjectConfigRef = upsertExamSubjectConfigRef;

exports.upsertExamSubjectConfig = function upsertExamSubjectConfig(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertExamSubjectConfigRef(dcInstance, inputVars));
}
;

const deleteExamSubjectConfigRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExamSubjectConfig', inputVars);
}
deleteExamSubjectConfigRef.operationName = 'DeleteExamSubjectConfig';
exports.deleteExamSubjectConfigRef = deleteExamSubjectConfigRef;

exports.deleteExamSubjectConfig = function deleteExamSubjectConfig(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteExamSubjectConfigRef(dcInstance, inputVars));
}
;

const upsertStudentMarkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertStudentMark', inputVars);
}
upsertStudentMarkRef.operationName = 'UpsertStudentMark';
exports.upsertStudentMarkRef = upsertStudentMarkRef;

exports.upsertStudentMark = function upsertStudentMark(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertStudentMarkRef(dcInstance, inputVars));
}
;

const publishExamSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PublishExamSection', inputVars);
}
publishExamSectionRef.operationName = 'PublishExamSection';
exports.publishExamSectionRef = publishExamSectionRef;

exports.publishExamSection = function publishExamSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(publishExamSectionRef(dcInstance, inputVars));
}
;

const unpublishExamSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UnpublishExamSection', inputVars);
}
unpublishExamSectionRef.operationName = 'UnpublishExamSection';
exports.unpublishExamSectionRef = unpublishExamSectionRef;

exports.unpublishExamSection = function unpublishExamSection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(unpublishExamSectionRef(dcInstance, inputVars));
}
;

const updateFcmTokenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFcmToken', inputVars);
}
updateFcmTokenRef.operationName = 'UpdateFcmToken';
exports.updateFcmTokenRef = updateFcmTokenRef;

exports.updateFcmToken = function updateFcmToken(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFcmTokenRef(dcInstance, inputVars));
}
;

const recordMarksAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordMarksAuditLog', inputVars);
}
recordMarksAuditLogRef.operationName = 'RecordMarksAuditLog';
exports.recordMarksAuditLogRef = recordMarksAuditLogRef;

exports.recordMarksAuditLog = function recordMarksAuditLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(recordMarksAuditLogRef(dcInstance, inputVars));
}
;

const getCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser', inputVars);
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCurrentUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUserByPhoneRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByPhone', inputVars);
}
getUserByPhoneRef.operationName = 'GetUserByPhone';
exports.getUserByPhoneRef = getUserByPhoneRef;

exports.getUserByPhone = function getUserByPhone(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserByPhoneRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUserRoleForClaimsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserRoleForClaims', inputVars);
}
getUserRoleForClaimsRef.operationName = 'GetUserRoleForClaims';
exports.getUserRoleForClaimsRef = getUserRoleForClaimsRef;

exports.getUserRoleForClaims = function getUserRoleForClaims(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserRoleForClaimsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUserRolesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserRoles', inputVars);
}
getUserRolesRef.operationName = 'GetUserRoles';
exports.getUserRolesRef = getUserRolesRef;

exports.getUserRoles = function getUserRoles(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserRolesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentsByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentsByBranch', inputVars);
}
getStudentsByBranchRef.operationName = 'GetStudentsByBranch';
exports.getStudentsByBranchRef = getStudentsByBranchRef;

exports.getStudentsByBranch = function getStudentsByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentsByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentsBySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentsBySection', inputVars);
}
getStudentsBySectionRef.operationName = 'GetStudentsBySection';
exports.getStudentsBySectionRef = getStudentsBySectionRef;

exports.getStudentsBySection = function getStudentsBySection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentsBySectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getParentChildrenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParentChildren', inputVars);
}
getParentChildrenRef.operationName = 'GetParentChildren';
exports.getParentChildrenRef = getParentChildrenRef;

exports.getParentChildren = function getParentChildren(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getParentChildrenRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getParentChildrenByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParentChildrenByUser', inputVars);
}
getParentChildrenByUserRef.operationName = 'GetParentChildrenByUser';
exports.getParentChildrenByUserRef = getParentChildrenByUserRef;

exports.getParentChildrenByUser = function getParentChildrenByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getParentChildrenByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentParentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentParents', inputVars);
}
getStudentParentsRef.operationName = 'GetStudentParents';
exports.getStudentParentsRef = getStudentParentsRef;

exports.getStudentParents = function getStudentParents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentParentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getParentByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParentByUser', inputVars);
}
getParentByUserRef.operationName = 'GetParentByUser';
exports.getParentByUserRef = getParentByUserRef;

exports.getParentByUser = function getParentByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getParentByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getParentByPhoneRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParentByPhone', inputVars);
}
getParentByPhoneRef.operationName = 'GetParentByPhone';
exports.getParentByPhoneRef = getParentByPhoneRef;

exports.getParentByPhone = function getParentByPhone(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getParentByPhoneRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranches', inputVars);
}
getBranchesRef.operationName = 'GetBranches';
exports.getBranchesRef = getBranchesRef;

exports.getBranches = function getBranches(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getBranchesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranchDetails', inputVars);
}
getBranchDetailsRef.operationName = 'GetBranchDetails';
exports.getBranchDetailsRef = getBranchDetailsRef;

exports.getBranchDetails = function getBranchDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBranchDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUsersByRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUsersByRole', inputVars);
}
getUsersByRoleRef.operationName = 'GetUsersByRole';
exports.getUsersByRoleRef = getUsersByRoleRef;

exports.getUsersByRole = function getUsersByRole(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUsersByRoleRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAssignmentConflictsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAssignmentConflicts', inputVars);
}
getAssignmentConflictsRef.operationName = 'GetAssignmentConflicts';
exports.getAssignmentConflictsRef = getAssignmentConflictsRef;

exports.getAssignmentConflicts = function getAssignmentConflicts(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAssignmentConflictsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getGlobalClassesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGlobalClasses', inputVars);
}
getGlobalClassesRef.operationName = 'GetGlobalClasses';
exports.getGlobalClassesRef = getGlobalClassesRef;

exports.getGlobalClasses = function getGlobalClasses(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getGlobalClassesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassDetails', inputVars);
}
getClassDetailsRef.operationName = 'GetClassDetails';
exports.getClassDetailsRef = getClassDetailsRef;

exports.getClassDetails = function getClassDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getGlobalStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGlobalStudents', inputVars);
}
getGlobalStudentsRef.operationName = 'GetGlobalStudents';
exports.getGlobalStudentsRef = getGlobalStudentsRef;

exports.getGlobalStudents = function getGlobalStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getGlobalStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentProfile', inputVars);
}
getStudentProfileRef.operationName = 'GetStudentProfile';
exports.getStudentProfileRef = getStudentProfileRef;

exports.getStudentProfile = function getStudentProfile(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentAttendanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentAttendance', inputVars);
}
getStudentAttendanceRef.operationName = 'GetStudentAttendance';
exports.getStudentAttendanceRef = getStudentAttendanceRef;

exports.getStudentAttendance = function getStudentAttendance(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentAttendanceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentFeeHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentFeeHistory', inputVars);
}
getStudentFeeHistoryRef.operationName = 'GetStudentFeeHistory';
exports.getStudentFeeHistoryRef = getStudentFeeHistoryRef;

exports.getStudentFeeHistory = function getStudentFeeHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentFeeHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getDashboardStatisticsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDashboardStatistics');
}
getDashboardStatisticsRef.operationName = 'GetDashboardStatistics';
exports.getDashboardStatisticsRef = getDashboardStatisticsRef;

exports.getDashboardStatistics = function getDashboardStatistics(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getDashboardStatisticsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getWingsByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetWingsByBranch', inputVars);
}
getWingsByBranchRef.operationName = 'GetWingsByBranch';
exports.getWingsByBranchRef = getWingsByBranchRef;

exports.getWingsByBranch = function getWingsByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getWingsByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassesByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassesByWing', inputVars);
}
getClassesByWingRef.operationName = 'GetClassesByWing';
exports.getClassesByWingRef = getClassesByWingRef;

exports.getClassesByWing = function getClassesByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassesByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSectionsByClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSectionsByClass', inputVars);
}
getSectionsByClassRef.operationName = 'GetSectionsByClass';
exports.getSectionsByClassRef = getSectionsByClassRef;

exports.getSectionsByClass = function getSectionsByClass(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSectionsByClassRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSectionClassTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSectionClassTeacher', inputVars);
}
getSectionClassTeacherRef.operationName = 'GetSectionClassTeacher';
exports.getSectionClassTeacherRef = getSectionClassTeacherRef;

exports.getSectionClassTeacher = function getSectionClassTeacher(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSectionClassTeacherRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeacherAssignmentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeacherAssignments', inputVars);
}
getTeacherAssignmentsRef.operationName = 'GetTeacherAssignments';
exports.getTeacherAssignmentsRef = getTeacherAssignmentsRef;

exports.getTeacherAssignments = function getTeacherAssignments(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeacherAssignmentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const searchStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchStudents', inputVars);
}
searchStudentsRef.operationName = 'SearchStudents';
exports.searchStudentsRef = searchStudentsRef;

exports.searchStudents = function searchStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentIdSequenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentIdSequence', inputVars);
}
getStudentIdSequenceRef.operationName = 'GetStudentIdSequence';
exports.getStudentIdSequenceRef = getStudentIdSequenceRef;

exports.getStudentIdSequence = function getStudentIdSequence(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentIdSequenceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentDetails', inputVars);
}
getStudentDetailsRef.operationName = 'GetStudentDetails';
exports.getStudentDetailsRef = getStudentDetailsRef;

exports.getStudentDetails = function getStudentDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudents', inputVars);
}
getStudentsRef.operationName = 'GetStudents';
exports.getStudentsRef = getStudentsRef;

exports.getStudents = function getStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStaffIdSequenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStaffIdSequence', inputVars);
}
getStaffIdSequenceRef.operationName = 'GetStaffIdSequence';
exports.getStaffIdSequenceRef = getStaffIdSequenceRef;

exports.getStaffIdSequence = function getStaffIdSequence(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStaffIdSequenceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getEmployeeSequenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEmployeeSequence', inputVars);
}
getEmployeeSequenceRef.operationName = 'GetEmployeeSequence';
exports.getEmployeeSequenceRef = getEmployeeSequenceRef;

exports.getEmployeeSequence = function getEmployeeSequence(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getEmployeeSequenceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStaffIdsByPrefixRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStaffIdsByPrefix', inputVars);
}
getStaffIdsByPrefixRef.operationName = 'GetStaffIdsByPrefix';
exports.getStaffIdsByPrefixRef = getStaffIdsByPrefixRef;

exports.getStaffIdsByPrefix = function getStaffIdsByPrefix(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStaffIdsByPrefixRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceByMonthRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceByMonth', inputVars);
}
getAttendanceByMonthRef.operationName = 'GetAttendanceByMonth';
exports.getAttendanceByMonthRef = getAttendanceByMonthRef;

exports.getAttendanceByMonth = function getAttendanceByMonth(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceByMonthRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceBySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceBySection', inputVars);
}
getAttendanceBySectionRef.operationName = 'GetAttendanceBySection';
exports.getAttendanceBySectionRef = getAttendanceBySectionRef;

exports.getAttendanceBySection = function getAttendanceBySection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceBySectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceBySectionHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceBySectionHistory', inputVars);
}
getAttendanceBySectionHistoryRef.operationName = 'GetAttendanceBySectionHistory';
exports.getAttendanceBySectionHistoryRef = getAttendanceBySectionHistoryRef;

exports.getAttendanceBySectionHistory = function getAttendanceBySectionHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceBySectionHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceByBranch', inputVars);
}
getAttendanceByBranchRef.operationName = 'GetAttendanceByBranch';
exports.getAttendanceByBranchRef = getAttendanceByBranchRef;

exports.getAttendanceByBranch = function getAttendanceByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceByWing', inputVars);
}
getAttendanceByWingRef.operationName = 'GetAttendanceByWing';
exports.getAttendanceByWingRef = getAttendanceByWingRef;

exports.getAttendanceByWing = function getAttendanceByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getFeeDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFeeDetails', inputVars);
}
getFeeDetailsRef.operationName = 'GetFeeDetails';
exports.getFeeDetailsRef = getFeeDetailsRef;

exports.getFeeDetails = function getFeeDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getFeeDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getFeeRecordsByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFeeRecordsByBranch', inputVars);
}
getFeeRecordsByBranchRef.operationName = 'GetFeeRecordsByBranch';
exports.getFeeRecordsByBranchRef = getFeeRecordsByBranchRef;

exports.getFeeRecordsByBranch = function getFeeRecordsByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getFeeRecordsByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAllFeeRecordsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllFeeRecords', inputVars);
}
getAllFeeRecordsRef.operationName = 'GetAllFeeRecords';
exports.getAllFeeRecordsRef = getAllFeeRecordsRef;

exports.getAllFeeRecords = function getAllFeeRecords(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getAllFeeRecordsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getDueStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDueStudents', inputVars);
}
getDueStudentsRef.operationName = 'GetDueStudents';
exports.getDueStudentsRef = getDueStudentsRef;

exports.getDueStudents = function getDueStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDueStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPaidStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPaidStudents', inputVars);
}
getPaidStudentsRef.operationName = 'GetPaidStudents';
exports.getPaidStudentsRef = getPaidStudentsRef;

exports.getPaidStudents = function getPaidStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPaidStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchAnalyticsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranchAnalytics', inputVars);
}
getBranchAnalyticsRef.operationName = 'GetBranchAnalytics';
exports.getBranchAnalyticsRef = getBranchAnalyticsRef;

exports.getBranchAnalytics = function getBranchAnalytics(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBranchAnalyticsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassAnalyticsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassAnalytics', inputVars);
}
getClassAnalyticsRef.operationName = 'GetClassAnalytics';
exports.getClassAnalyticsRef = getClassAnalyticsRef;

exports.getClassAnalytics = function getClassAnalytics(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassAnalyticsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAcademicClassesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAcademicClasses', inputVars);
}
getAcademicClassesRef.operationName = 'GetAcademicClasses';
exports.getAcademicClassesRef = getAcademicClassesRef;

exports.getAcademicClasses = function getAcademicClasses(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getAcademicClassesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getActiveAcademicClassesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveAcademicClasses', inputVars);
}
getActiveAcademicClassesRef.operationName = 'GetActiveAcademicClasses';
exports.getActiveAcademicClassesRef = getActiveAcademicClassesRef;

exports.getActiveAcademicClasses = function getActiveAcademicClasses(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getActiveAcademicClassesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassesByWingCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassesByWingCode', inputVars);
}
getClassesByWingCodeRef.operationName = 'GetClassesByWingCode';
exports.getClassesByWingCodeRef = getClassesByWingCodeRef;

exports.getClassesByWingCode = function getClassesByWingCode(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassesByWingCodeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCoordinatorsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoordinators', inputVars);
}
getCoordinatorsRef.operationName = 'GetCoordinators';
exports.getCoordinatorsRef = getCoordinatorsRef;

exports.getCoordinators = function getCoordinators(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCoordinatorsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCoordinatorDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoordinatorDetails', inputVars);
}
getCoordinatorDetailsRef.operationName = 'GetCoordinatorDetails';
exports.getCoordinatorDetailsRef = getCoordinatorDetailsRef;

exports.getCoordinatorDetails = function getCoordinatorDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCoordinatorDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCoordinatorByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoordinatorByUser', inputVars);
}
getCoordinatorByUserRef.operationName = 'GetCoordinatorByUser';
exports.getCoordinatorByUserRef = getCoordinatorByUserRef;

exports.getCoordinatorByUser = function getCoordinatorByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCoordinatorByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSectionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSections', inputVars);
}
getSectionsRef.operationName = 'GetSections';
exports.getSectionsRef = getSectionsRef;

exports.getSections = function getSections(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSectionsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSectionsByClassAndYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSectionsByClassAndYear', inputVars);
}
getSectionsByClassAndYearRef.operationName = 'GetSectionsByClassAndYear';
exports.getSectionsByClassAndYearRef = getSectionsByClassAndYearRef;

exports.getSectionsByClassAndYear = function getSectionsByClassAndYear(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSectionsByClassAndYearRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPrincipalDashboardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPrincipalDashboard', inputVars);
}
getPrincipalDashboardRef.operationName = 'GetPrincipalDashboard';
exports.getPrincipalDashboardRef = getPrincipalDashboardRef;

exports.getPrincipalDashboard = function getPrincipalDashboard(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPrincipalDashboardRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentsByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentsByWing', inputVars);
}
getStudentsByWingRef.operationName = 'GetStudentsByWing';
exports.getStudentsByWingRef = getStudentsByWingRef;

exports.getStudentsByWing = function getStudentsByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentsByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCoordinatorStudentsByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoordinatorStudentsByWing', inputVars);
}
getCoordinatorStudentsByWingRef.operationName = 'GetCoordinatorStudentsByWing';
exports.getCoordinatorStudentsByWingRef = getCoordinatorStudentsByWingRef;

exports.getCoordinatorStudentsByWing = function getCoordinatorStudentsByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCoordinatorStudentsByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPromotionHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPromotionHistory', inputVars);
}
getPromotionHistoryRef.operationName = 'GetPromotionHistory';
exports.getPromotionHistoryRef = getPromotionHistoryRef;

exports.getPromotionHistory = function getPromotionHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getPromotionHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentSequenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentSequence', inputVars);
}
getStudentSequenceRef.operationName = 'GetStudentSequence';
exports.getStudentSequenceRef = getStudentSequenceRef;

exports.getStudentSequence = function getStudentSequence(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentSequenceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const generateAdmissionNumberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GenerateAdmissionNumber', inputVars);
}
generateAdmissionNumberRef.operationName = 'GenerateAdmissionNumber';
exports.generateAdmissionNumberRef = generateAdmissionNumberRef;

exports.generateAdmissionNumber = function generateAdmissionNumber(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(generateAdmissionNumberRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getLastStudentSerialRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLastStudentSerial', inputVars);
}
getLastStudentSerialRef.operationName = 'GetLastStudentSerial';
exports.getLastStudentSerialRef = getLastStudentSerialRef;

exports.getLastStudentSerial = function getLastStudentSerial(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getLastStudentSerialRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeachersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeachers', inputVars);
}
getTeachersRef.operationName = 'GetTeachers';
exports.getTeachersRef = getTeachersRef;

exports.getTeachers = function getTeachers(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeachersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeachersByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeachersByBranch', inputVars);
}
getTeachersByBranchRef.operationName = 'GetTeachersByBranch';
exports.getTeachersByBranchRef = getTeachersByBranchRef;

exports.getTeachersByBranch = function getTeachersByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeachersByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeachersByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeachersByWing', inputVars);
}
getTeachersByWingRef.operationName = 'GetTeachersByWing';
exports.getTeachersByWingRef = getTeachersByWingRef;

exports.getTeachersByWing = function getTeachersByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeachersByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getCoordinatorTeachersByWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCoordinatorTeachersByWing', inputVars);
}
getCoordinatorTeachersByWingRef.operationName = 'GetCoordinatorTeachersByWing';
exports.getCoordinatorTeachersByWingRef = getCoordinatorTeachersByWingRef;

exports.getCoordinatorTeachersByWing = function getCoordinatorTeachersByWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCoordinatorTeachersByWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeacherProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeacherProfile', inputVars);
}
getTeacherProfileRef.operationName = 'GetTeacherProfile';
exports.getTeacherProfileRef = getTeacherProfileRef;

exports.getTeacherProfile = function getTeacherProfile(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeacherProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeacherProfileByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeacherProfileByUser', inputVars);
}
getTeacherProfileByUserRef.operationName = 'GetTeacherProfileByUser';
exports.getTeacherProfileByUserRef = getTeacherProfileByUserRef;

exports.getTeacherProfileByUser = function getTeacherProfileByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeacherProfileByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTeacherDashboardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeacherDashboard', inputVars);
}
getTeacherDashboardRef.operationName = 'GetTeacherDashboard';
exports.getTeacherDashboardRef = getTeacherDashboardRef;

exports.getTeacherDashboard = function getTeacherDashboard(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeacherDashboardRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSubjectsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSubjects', inputVars);
}
getSubjectsRef.operationName = 'GetSubjects';
exports.getSubjectsRef = getSubjectsRef;

exports.getSubjects = function getSubjects(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getSubjectsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSectionsForTeacherAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSectionsForTeacherAssignment', inputVars);
}
getSectionsForTeacherAssignmentRef.operationName = 'GetSectionsForTeacherAssignment';
exports.getSectionsForTeacherAssignmentRef = getSectionsForTeacherAssignmentRef;

exports.getSectionsForTeacherAssignment = function getSectionsForTeacherAssignment(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSectionsForTeacherAssignmentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAccountantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAccountants', inputVars);
}
getAccountantsRef.operationName = 'GetAccountants';
exports.getAccountantsRef = getAccountantsRef;

exports.getAccountants = function getAccountants(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAccountantsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAccountantProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAccountantProfile', inputVars);
}
getAccountantProfileRef.operationName = 'GetAccountantProfile';
exports.getAccountantProfileRef = getAccountantProfileRef;

exports.getAccountantProfile = function getAccountantProfile(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAccountantProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAccountantByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAccountantByUser', inputVars);
}
getAccountantByUserRef.operationName = 'GetAccountantByUser';
exports.getAccountantByUserRef = getAccountantByUserRef;

exports.getAccountantByUser = function getAccountantByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAccountantByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getFeeCategoriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFeeCategories', inputVars);
}
getFeeCategoriesRef.operationName = 'GetFeeCategories';
exports.getFeeCategoriesRef = getFeeCategoriesRef;

exports.getFeeCategories = function getFeeCategories(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getFeeCategoriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassTeacherAssignmentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassTeacherAssignments', inputVars);
}
getClassTeacherAssignmentsRef.operationName = 'GetClassTeacherAssignments';
exports.getClassTeacherAssignmentsRef = getClassTeacherAssignmentsRef;

exports.getClassTeacherAssignments = function getClassTeacherAssignments(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassTeacherAssignmentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassFeesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassFees', inputVars);
}
getClassFeesRef.operationName = 'GetClassFees';
exports.getClassFeesRef = getClassFeesRef;

exports.getClassFees = function getClassFees(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassFeesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentFeeProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentFeeProfile', inputVars);
}
getStudentFeeProfileRef.operationName = 'GetStudentFeeProfile';
exports.getStudentFeeProfileRef = getStudentFeeProfileRef;

exports.getStudentFeeProfile = function getStudentFeeProfile(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentFeeProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPaymentHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPaymentHistory', inputVars);
}
getPaymentHistoryRef.operationName = 'GetPaymentHistory';
exports.getPaymentHistoryRef = getPaymentHistoryRef;

exports.getPaymentHistory = function getPaymentHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPaymentHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getReceiptSequenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetReceiptSequence', inputVars);
}
getReceiptSequenceRef.operationName = 'GetReceiptSequence';
exports.getReceiptSequenceRef = getReceiptSequenceRef;

exports.getReceiptSequence = function getReceiptSequence(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getReceiptSequenceRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getFeeReportsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFeeReports', inputVars);
}
getFeeReportsRef.operationName = 'GetFeeReports';
exports.getFeeReportsRef = getFeeReportsRef;

exports.getFeeReports = function getFeeReports(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getFeeReportsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getGlobalStudentExplorerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGlobalStudentExplorer', inputVars);
}
getGlobalStudentExplorerRef.operationName = 'GetGlobalStudentExplorer';
exports.getGlobalStudentExplorerRef = getGlobalStudentExplorerRef;

exports.getGlobalStudentExplorer = function getGlobalStudentExplorer(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getGlobalStudentExplorerRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getGlobalReportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGlobalReports');
}
getGlobalReportsRef.operationName = 'GetGlobalReports';
exports.getGlobalReportsRef = getGlobalReportsRef;

exports.getGlobalReports = function getGlobalReports(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getGlobalReportsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuditLogs', inputVars);
}
getAuditLogsRef.operationName = 'GetAuditLogs';
exports.getAuditLogsRef = getAuditLogsRef;

exports.getAuditLogs = function getAuditLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(getAuditLogsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassFeeReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassFeeReport', inputVars);
}
getClassFeeReportRef.operationName = 'GetClassFeeReport';
exports.getClassFeeReportRef = getClassFeeReportRef;

exports.getClassFeeReport = function getClassFeeReport(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassFeeReportRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassStudentsFeeStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassStudentsFeeStatus', inputVars);
}
getClassStudentsFeeStatusRef.operationName = 'GetClassStudentsFeeStatus';
exports.getClassStudentsFeeStatusRef = getClassStudentsFeeStatusRef;

exports.getClassStudentsFeeStatus = function getClassStudentsFeeStatus(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassStudentsFeeStatusRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassCollectionSummaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassCollectionSummary', inputVars);
}
getClassCollectionSummaryRef.operationName = 'GetClassCollectionSummary';
exports.getClassCollectionSummaryRef = getClassCollectionSummaryRef;

exports.getClassCollectionSummary = function getClassCollectionSummary(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassCollectionSummaryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getClassOutstandingSummaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassOutstandingSummary', inputVars);
}
getClassOutstandingSummaryRef.operationName = 'GetClassOutstandingSummary';
exports.getClassOutstandingSummaryRef = getClassOutstandingSummaryRef;

exports.getClassOutstandingSummary = function getClassOutstandingSummary(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClassOutstandingSummaryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUsersByPhoneRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUsersByPhone', inputVars);
}
getUsersByPhoneRef.operationName = 'GetUsersByPhone';
exports.getUsersByPhoneRef = getUsersByPhoneRef;

exports.getUsersByPhone = function getUsersByPhone(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUsersByPhoneRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getNoticesByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNoticesByBranch', inputVars);
}
getNoticesByBranchRef.operationName = 'GetNoticesByBranch';
exports.getNoticesByBranchRef = getNoticesByBranchRef;

exports.getNoticesByBranch = function getNoticesByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getNoticesByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getNoticesByBranchCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNoticesByBranchCategory', inputVars);
}
getNoticesByBranchCategoryRef.operationName = 'GetNoticesByBranchCategory';
exports.getNoticesByBranchCategoryRef = getNoticesByBranchCategoryRef;

exports.getNoticesByBranchCategory = function getNoticesByBranchCategory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getNoticesByBranchCategoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTimetableForSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimetableForSection', inputVars);
}
getTimetableForSectionRef.operationName = 'GetTimetableForSection';
exports.getTimetableForSectionRef = getTimetableForSectionRef;

exports.getTimetableForSection = function getTimetableForSection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTimetableForSectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTimetablesForBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimetablesForBranch', inputVars);
}
getTimetablesForBranchRef.operationName = 'GetTimetablesForBranch';
exports.getTimetablesForBranchRef = getTimetablesForBranchRef;

exports.getTimetablesForBranch = function getTimetablesForBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTimetablesForBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTimetablesForWingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimetablesForWing', inputVars);
}
getTimetablesForWingRef.operationName = 'GetTimetablesForWing';
exports.getTimetablesForWingRef = getTimetablesForWingRef;

exports.getTimetablesForWing = function getTimetablesForWing(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTimetablesForWingRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTimetableForTeacherRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimetableForTeacher', inputVars);
}
getTimetableForTeacherRef.operationName = 'GetTimetableForTeacher';
exports.getTimetableForTeacherRef = getTimetableForTeacherRef;

exports.getTimetableForTeacher = function getTimetableForTeacher(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTimetableForTeacherRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSuggestionsByParentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSuggestionsByParent', inputVars);
}
getSuggestionsByParentRef.operationName = 'GetSuggestionsByParent';
exports.getSuggestionsByParentRef = getSuggestionsByParentRef;

exports.getSuggestionsByParent = function getSuggestionsByParent(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSuggestionsByParentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getSuggestionsByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSuggestionsByBranch', inputVars);
}
getSuggestionsByBranchRef.operationName = 'GetSuggestionsByBranch';
exports.getSuggestionsByBranchRef = getSuggestionsByBranchRef;

exports.getSuggestionsByBranch = function getSuggestionsByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getSuggestionsByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getNotificationsByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNotificationsByUser', inputVars);
}
getNotificationsByUserRef.operationName = 'GetNotificationsByUser';
exports.getNotificationsByUserRef = getNotificationsByUserRef;

exports.getNotificationsByUser = function getNotificationsByUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getNotificationsByUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUnreadNotificationCountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUnreadNotificationCount', inputVars);
}
getUnreadNotificationCountRef.operationName = 'GetUnreadNotificationCount';
exports.getUnreadNotificationCountRef = getUnreadNotificationCountRef;

exports.getUnreadNotificationCount = function getUnreadNotificationCount(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUnreadNotificationCountRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchStaffUserIdsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranchStaffUserIds', inputVars);
}
getBranchStaffUserIdsRef.operationName = 'GetBranchStaffUserIds';
exports.getBranchStaffUserIdsRef = getBranchStaffUserIdsRef;

exports.getBranchStaffUserIds = function getBranchStaffUserIds(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBranchStaffUserIdsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchStudentsWithParentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranchStudentsWithParents', inputVars);
}
getBranchStudentsWithParentsRef.operationName = 'GetBranchStudentsWithParents';
exports.getBranchStudentsWithParentsRef = getBranchStudentsWithParentsRef;

exports.getBranchStudentsWithParents = function getBranchStudentsWithParents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBranchStudentsWithParentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUserForRoleChangeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserForRoleChange', inputVars);
}
getUserForRoleChangeRef.operationName = 'GetUserForRoleChange';
exports.getUserForRoleChangeRef = getUserForRoleChangeRef;

exports.getUserForRoleChange = function getUserForRoleChange(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserForRoleChangeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAcademicYearsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAcademicYears', inputVars);
}
getAcademicYearsRef.operationName = 'GetAcademicYears';
exports.getAcademicYearsRef = getAcademicYearsRef;

exports.getAcademicYears = function getAcademicYears(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAcademicYearsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getActiveAcademicYearRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveAcademicYear', inputVars);
}
getActiveAcademicYearRef.operationName = 'GetActiveAcademicYear';
exports.getActiveAcademicYearRef = getActiveAcademicYearRef;

exports.getActiveAcademicYear = function getActiveAcademicYear(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getActiveAcademicYearRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getBranchPromotionHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetBranchPromotionHistory', inputVars);
}
getBranchPromotionHistoryRef.operationName = 'GetBranchPromotionHistory';
exports.getBranchPromotionHistoryRef = getBranchPromotionHistoryRef;

exports.getBranchPromotionHistory = function getBranchPromotionHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getBranchPromotionHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getHolidaysByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHolidaysByBranch', inputVars);
}
getHolidaysByBranchRef.operationName = 'GetHolidaysByBranch';
exports.getHolidaysByBranchRef = getHolidaysByBranchRef;

exports.getHolidaysByBranch = function getHolidaysByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHolidaysByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getHolidaysByMonthRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHolidaysByMonth', inputVars);
}
getHolidaysByMonthRef.operationName = 'GetHolidaysByMonth';
exports.getHolidaysByMonthRef = getHolidaysByMonthRef;

exports.getHolidaysByMonth = function getHolidaysByMonth(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHolidaysByMonthRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceLockStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceLockStatus', inputVars);
}
getAttendanceLockStatusRef.operationName = 'GetAttendanceLockStatus';
exports.getAttendanceLockStatusRef = getAttendanceLockStatusRef;

exports.getAttendanceLockStatus = function getAttendanceLockStatus(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceLockStatusRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceAuditLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceAuditLog', inputVars);
}
getAttendanceAuditLogRef.operationName = 'GetAttendanceAuditLog';
exports.getAttendanceAuditLogRef = getAttendanceAuditLogRef;

exports.getAttendanceAuditLog = function getAttendanceAuditLog(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceAuditLogRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceAuditLogByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceAuditLogByBranch', inputVars);
}
getAttendanceAuditLogByBranchRef.operationName = 'GetAttendanceAuditLogByBranch';
exports.getAttendanceAuditLogByBranchRef = getAttendanceAuditLogByBranchRef;

exports.getAttendanceAuditLogByBranch = function getAttendanceAuditLogByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceAuditLogByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceAuditLogBySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceAuditLogBySection', inputVars);
}
getAttendanceAuditLogBySectionRef.operationName = 'GetAttendanceAuditLogBySection';
exports.getAttendanceAuditLogBySectionRef = getAttendanceAuditLogBySectionRef;

exports.getAttendanceAuditLogBySection = function getAttendanceAuditLogBySection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceAuditLogBySectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceSummaryByStudentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceSummaryByStudent', inputVars);
}
getAttendanceSummaryByStudentRef.operationName = 'GetAttendanceSummaryByStudent';
exports.getAttendanceSummaryByStudentRef = getAttendanceSummaryByStudentRef;

exports.getAttendanceSummaryByStudent = function getAttendanceSummaryByStudent(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceSummaryByStudentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceSummaryBySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceSummaryBySection', inputVars);
}
getAttendanceSummaryBySectionRef.operationName = 'GetAttendanceSummaryBySection';
exports.getAttendanceSummaryBySectionRef = getAttendanceSummaryBySectionRef;

exports.getAttendanceSummaryBySection = function getAttendanceSummaryBySection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceSummaryBySectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getLowAttendanceStudentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLowAttendanceStudents', inputVars);
}
getLowAttendanceStudentsRef.operationName = 'GetLowAttendanceStudents';
exports.getLowAttendanceStudentsRef = getLowAttendanceStudentsRef;

exports.getLowAttendanceStudents = function getLowAttendanceStudents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getLowAttendanceStudentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getDailyAttendanceReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDailyAttendanceReport', inputVars);
}
getDailyAttendanceReportRef.operationName = 'GetDailyAttendanceReport';
exports.getDailyAttendanceReportRef = getDailyAttendanceReportRef;

exports.getDailyAttendanceReport = function getDailyAttendanceReport(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDailyAttendanceReportRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMonthlyAttendanceReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMonthlyAttendanceReport', inputVars);
}
getMonthlyAttendanceReportRef.operationName = 'GetMonthlyAttendanceReport';
exports.getMonthlyAttendanceReportRef = getMonthlyAttendanceReportRef;

exports.getMonthlyAttendanceReport = function getMonthlyAttendanceReport(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getMonthlyAttendanceReportRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getAttendanceAlertLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAttendanceAlertLog', inputVars);
}
getAttendanceAlertLogRef.operationName = 'GetAttendanceAlertLog';
exports.getAttendanceAlertLogRef = getAttendanceAlertLogRef;

exports.getAttendanceAlertLog = function getAttendanceAlertLog(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAttendanceAlertLogRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getExamsByBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExamsByBranch', inputVars);
}
getExamsByBranchRef.operationName = 'GetExamsByBranch';
exports.getExamsByBranchRef = getExamsByBranchRef;

exports.getExamsByBranch = function getExamsByBranch(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExamsByBranchRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getExamDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExamDetails', inputVars);
}
getExamDetailsRef.operationName = 'GetExamDetails';
exports.getExamDetailsRef = getExamDetailsRef;

exports.getExamDetails = function getExamDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExamDetailsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMarksForSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarksForSection', inputVars);
}
getMarksForSectionRef.operationName = 'GetMarksForSection';
exports.getMarksForSectionRef = getMarksForSectionRef;

exports.getMarksForSection = function getMarksForSection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getMarksForSectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentResultsForParentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentResultsForParent', inputVars);
}
getStudentResultsForParentRef.operationName = 'GetStudentResultsForParent';
exports.getStudentResultsForParentRef = getStudentResultsForParentRef;

exports.getStudentResultsForParent = function getStudentResultsForParent(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentResultsForParentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getStudentResultDetailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetStudentResultDetail', inputVars);
}
getStudentResultDetailRef.operationName = 'GetStudentResultDetail';
exports.getStudentResultDetailRef = getStudentResultDetailRef;

exports.getStudentResultDetail = function getStudentResultDetail(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getStudentResultDetailRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getExamAnalyticsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExamAnalytics', inputVars);
}
getExamAnalyticsRef.operationName = 'GetExamAnalytics';
exports.getExamAnalyticsRef = getExamAnalyticsRef;

exports.getExamAnalytics = function getExamAnalytics(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExamAnalyticsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPublishedExamsForSectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublishedExamsForSection', inputVars);
}
getPublishedExamsForSectionRef.operationName = 'GetPublishedExamsForSection';
exports.getPublishedExamsForSectionRef = getPublishedExamsForSectionRef;

exports.getPublishedExamsForSection = function getPublishedExamsForSection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPublishedExamsForSectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getExamsBySectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExamsBySection', inputVars);
}
getExamsBySectionRef.operationName = 'GetExamsBySection';
exports.getExamsBySectionRef = getExamsBySectionRef;

exports.getExamsBySection = function getExamsBySection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getExamsBySectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
