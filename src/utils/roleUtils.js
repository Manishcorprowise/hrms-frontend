// Role-based access control utilities

// Define available roles and their hierarchy
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  MANAGER: 'manager'
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.EMPLOYEE]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4
};

// Check if user has required role
export const hasRole = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  
  // If requiredRoles is a single role, convert to array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return roles.includes(userRole);
};

// Check if user has minimum role level
export const hasMinimumRole = (userRole, minimumRole) => {
  if (!userRole || !minimumRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;
  
  return userLevel >= minimumLevel;
};

// Check if user has any of the specified roles
export const hasAnyRole = (userRole, roles) => {
  if (!userRole || !roles) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(userRole);
};

// Get user's role level
export const getRoleLevel = (userRole) => {
  return ROLE_HIERARCHY[userRole] || 0;
};

// Check if user is admin or super admin
export const isAdmin = (userRole) => {
  return hasRole(userRole, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
};

// Check if user is super admin
export const isSuperAdmin = (userRole) => {
  return userRole === ROLES.SUPER_ADMIN;
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.EMPLOYEE]: 'Employee'
  };
  
  return displayNames[role] || role;
};

// Get role color for UI
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.SUPER_ADMIN]: 'error',
    [ROLES.ADMIN]: 'warning',
    [ROLES.EMPLOYEE]: 'primary'
  };
  
  return colors[role] || 'default';
};
