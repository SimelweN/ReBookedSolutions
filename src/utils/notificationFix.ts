/**
 * Utility to prevent duplicate welcome notifications
 */

let lastWelcomeNotification: string | null = null;

export const shouldShowWelcomeNotification = (userId: string): boolean => {
  const today = new Date().toDateString();
  const key = `welcome_${userId}_${today}`;

  if (lastWelcomeNotification === key) {
    return false;
  }

  // Check localStorage for today's notification
  const lastShown = localStorage.getItem(`last_welcome_${userId}`);
  if (lastShown === today) {
    return false;
  }

  // Mark as shown
  localStorage.setItem(`last_welcome_${userId}`, today);
  lastWelcomeNotification = key;

  return true;
};

export const clearWelcomeNotificationCache = () => {
  lastWelcomeNotification = null;
};
