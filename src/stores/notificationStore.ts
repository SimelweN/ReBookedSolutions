import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '@/components/notifications/NotificationStack';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Commit & Transaction specific actions
  addCommitRequiredNotification: (orderId: string, sellerId: string, deadline: string) => void;
  addSellerCommittedNotification: (orderId: string, buyerId: string) => void;
  addAutoCancel ledNotification: (orderId: string, sellerId: string, buyerId: string) => void;
  addPickupConfirmedNotification: (orderId: string, buyerId: string, sellerId: string) => void;
  addOrderCancelledNotification: (orderId: string, cancelledBy: string, reason: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const unreadDecrease = notification && !notification.read ? 1 : 0;
          
          return {
            notifications: state.notifications.filter((notif) => notif.id !== id),
            unreadCount: Math.max(0, state.unreadCount - unreadDecrease),
          };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Commit & Transaction Notifications
      addCommitRequiredNotification: (orderId, sellerId, deadline) => {
        const { addNotification } = get();
        addNotification({
          type: 'commit_required',
          title: '⏰ Commitment Required',
          message: `You have 48 hours to commit to order ${orderId}. Please confirm you can fulfill this order or it will be automatically cancelled.`,
          orderId,
          sellerId,
          deadline,
          priority: 'urgent',
          read: false,
          actions: [
            {
              label: 'Commit Now',
              action: () => {
                // Navigate to commit page
                window.location.href = `/commit/${orderId}`;
              },
              variant: 'default',
            },
            {
              label: 'View Order',
              action: () => {
                window.location.href = `/orders/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });
      },

      addSellerCommittedNotification: (orderId, buyerId) => {
        const { addNotification } = get();
        addNotification({
          type: 'seller_committed',
          title: '✅ Seller Committed',
          message: `Great news! The seller has committed to your order ${orderId}. Your book is now being prepared for delivery.`,
          orderId,
          buyerId,
          priority: 'high',
          read: false,
          actions: [
            {
              label: 'Track Order',
              action: () => {
                window.location.href = `/track/${orderId}`;
              },
              variant: 'default',
            },
            {
              label: 'View Details',
              action: () => {
                window.location.href = `/orders/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });
      },

      addAutoCancelledNotification: (orderId, sellerId, buyerId) => {
        const { addNotification } = get();
        
        // Notification for seller
        addNotification({
          type: 'auto_cancelled',
          title: '❌ Order Auto-Cancelled',
          message: `Order ${orderId} has been automatically cancelled due to missed 48-hour commitment deadline. Your seller rating may be affected.`,
          orderId,
          sellerId,
          priority: 'urgent',
          read: false,
          actions: [
            {
              label: 'View Details',
              action: () => {
                window.location.href = `/orders/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });

        // Notification for buyer
        addNotification({
          type: 'auto_cancelled',
          title: '❌ Order Cancelled',
          message: `Your order ${orderId} has been cancelled because the seller didn't commit within 48 hours. Your refund will be processed automatically.`,
          orderId,
          buyerId,
          priority: 'high',
          read: false,
          actions: [
            {
              label: 'Find Similar Books',
              action: () => {
                window.location.href = '/books';
              },
              variant: 'default',
            },
            {
              label: 'View Refund Status',
              action: () => {
                window.location.href = `/refund/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });
      },

      addPickupConfirmedNotification: (orderId, buyerId, sellerId) => {
        const { addNotification } = get();
        
        // Notification for buyer
        addNotification({
          type: 'pickup_confirmed',
          title: '🚚 Package Picked Up',
          message: `Your order ${orderId} has been picked up by the courier and is on its way to you!`,
          orderId,
          buyerId,
          priority: 'high',
          read: false,
          actions: [
            {
              label: 'Track Package',
              action: () => {
                window.location.href = `/track/${orderId}`;
              },
              variant: 'default',
            },
          ],
        });

        // Notification for seller
        addNotification({
          type: 'pickup_confirmed',
          title: '✅ Pickup Confirmed',
          message: `Your package for order ${orderId} has been successfully picked up by the courier. Payment will be released after delivery confirmation.`,
          orderId,
          sellerId,
          priority: 'medium',
          read: false,
          actions: [
            {
              label: 'View Order',
              action: () => {
                window.location.href = `/orders/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });
      },

      addOrderCancelledNotification: (orderId, cancelledBy, reason) => {
        const { addNotification } = get();
        addNotification({
          type: 'order_cancelled',
          title: '❌ Order Cancelled',
          message: `Order ${orderId} has been cancelled by ${cancelledBy}. ${reason ? `Reason: ${reason}` : 'Refund will be processed automatically.'}`,
          orderId,
          priority: 'medium',
          read: false,
          actions: [
            {
              label: 'View Details',
              action: () => {
                window.location.href = `/orders/${orderId}`;
              },
              variant: 'outline',
            },
          ],
        });
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only last 50 notifications
        unreadCount: state.unreadCount,
      }),
    }
  )
);