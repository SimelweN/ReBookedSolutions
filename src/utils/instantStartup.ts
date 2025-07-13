/**
 * Minimal instant startup utility for AuthContext
 */

export const shouldSkipAuthLoading = () => {
  // In production, don't skip auth loading for security
  return false;
};
