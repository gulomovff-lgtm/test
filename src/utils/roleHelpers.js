/**
 * Role Helper Functions
 * Requirement #6: Role-based button visibility
 */

/**
 * Check if user has admin role
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Check if user has cashier role
 */
export const isCashier = (user) => {
  return user && user.role === 'cashier';
};

/**
 * Check if user can see export buttons
 * Requirement #6: Only admins can see export, import, merge, normalize buttons
 */
export const canSeeExportButtons = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can see import buttons
 * Requirement #6: Only admins can see import functionality
 */
export const canSeeImportButtons = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can see merge functionality
 * Requirement #6: Only admins can merge clients
 */
export const canSeeMergeButtons = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can normalize countries
 * Requirement #6: Only admins can normalize countries
 */
export const canNormalizeCountries = (user) => {
  return isAdmin(user);
};

/**
 * Get available actions for user role
 */
export const getAvailableActions = (user) => {
  const actions = {
    addNew: true,  // All roles can add new clients
    search: true,  // All roles can search
    export: canSeeExportButtons(user),
    import: canSeeImportButtons(user),
    merge: canSeeMergeButtons(user),
    normalizeCountries: canNormalizeCountries(user),
  };
  
  return actions;
};
