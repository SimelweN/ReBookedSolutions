/**
 * Minimal database connectivity helper for AuthContext
 */

export const createFallbackProfile = (userId: string) => {
  return {
    id: userId,
    name: "User",
    email: "user@example.com",
    phone: null,
    pickup_address: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
