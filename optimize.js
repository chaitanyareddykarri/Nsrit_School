const fs = require('fs');

function optimizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace duplicate roles with 'in'
  // e.g. {role: {eq: "MAIN_ADMIN"}}, {role: {eq: "main_admin"}} -> {role: {in: ["MAIN_ADMIN", "main_admin"]}}
  content = content.replace(
    /\{role: \{eq: "MAIN_ADMIN"\}\}\s*\{role: \{eq: "main_admin"\}\}/g,
    '{role: {in: ["MAIN_ADMIN", "main_admin"]}}'
  );

  content = content.replace(
    /\{userRoles_on_user: \{exist: \{role: \{eq: "MAIN_ADMIN"\}\}\}\}\s*\{userRoles_on_user: \{exist: \{role: \{eq: "main_admin"\}\}\}\}/g,
    '{userRoles_on_user: {exist: {role: {in: ["MAIN_ADMIN", "main_admin"]}}}}'
  );

  const principalRoles = [
    '{role: {eq: "PRINCIPAL"}}',
    '{role: {eq: "principal"}}',
    '{role: {eq: "BRANCH_ADMIN"}}',
    '{role: {eq: "branch_admin"}}',
    '{role: {eq: "COORDINATOR"}}',
    '{role: {eq: "coordinator"}}',
    '{role: {eq: "TEACHER"}}',
    '{role: {eq: "teacher"}}',
    '{role: {eq: "CLASS_TEACHER"}}',
    '{role: {eq: "class_teacher"}}'
  ].join('\\s*');

  const principalRolesRegex = new RegExp(principalRoles, 'g');
  content = content.replace(
    principalRolesRegex,
    '{role: {in: ["PRINCIPAL", "principal", "BRANCH_ADMIN", "branch_admin", "COORDINATOR", "coordinator", "TEACHER", "teacher", "CLASS_TEACHER", "class_teacher"]}}'
  );

  const principalUserRoles = [
    '{userRoles_on_user: {exist: {role: {eq: "PRINCIPAL"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "principal"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "BRANCH_ADMIN"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "branch_admin"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "COORDINATOR"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "coordinator"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "TEACHER"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "teacher"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "CLASS_TEACHER"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "class_teacher"}}}}'
  ].join('\\s*');

  const principalUserRolesRegex = new RegExp(principalUserRoles.replace(/\{/g, '\\{').replace(/\}/g, '\\}'), 'g');
  content = content.replace(
    principalUserRolesRegex,
    '{userRoles_on_user: {exist: {role: {in: ["PRINCIPAL", "principal", "BRANCH_ADMIN", "branch_admin", "COORDINATOR", "coordinator", "TEACHER", "teacher", "CLASS_TEACHER", "class_teacher"]}}}}'
  );

  const pRoles2 = [
    '{role: {eq: "PRINCIPAL"}}',
    '{role: {eq: "principal"}}',
    '{role: {eq: "BRANCH_ADMIN"}}',
    '{role: {eq: "branch_admin"}}',
    '{role: {eq: "COORDINATOR"}}',
    '{role: {eq: "coordinator"}}'
  ].join('\\s*');
  content = content.replace(
    new RegExp(pRoles2, 'g'),
    '{role: {in: ["PRINCIPAL", "principal", "BRANCH_ADMIN", "branch_admin", "COORDINATOR", "coordinator"]}}'
  );

  const puRoles2 = [
    '{userRoles_on_user: {exist: {role: {eq: "PRINCIPAL"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "principal"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "BRANCH_ADMIN"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "branch_admin"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "COORDINATOR"}}}}',
    '{userRoles_on_user: {exist: {role: {eq: "coordinator"}}}}'
  ].join('\\s*');
  content = content.replace(
    new RegExp(puRoles2.replace(/\{/g, '\\{').replace(/\}/g, '\\}'), 'g'),
    '{userRoles_on_user: {exist: {role: {in: ["PRINCIPAL", "principal", "BRANCH_ADMIN", "branch_admin", "COORDINATOR", "coordinator"]}}}}'
  );

  // Remove teacher_on_user again
  content = content.replace(/\{teacher_on_user:\s*\{branchId:\s*\{eq:\s*\$branchId\},\s*isActive:\s*\{eq:\s*true\}\}\}/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
}

optimizeFile('dataconnect/connectors/nsrit/mutations.gql');
optimizeFile('dataconnect/connectors/nsrit/queries.gql');
