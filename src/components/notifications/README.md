# 🔔 Notification System Implementation

## Overview

This comprehensive notification system implements all the requirements specified:

- Desktop/mobile responsive behavior
- Commit & transaction notifications
- Order cancellation functionality
- Automated deadline tracking

## 🎯 Features Implemented

### ✅ Display Behavior

**Desktop:**

- Notifications appear in top-right corner
- Most recent notification fully visible
- Others stack beneath (collapsed)
- Hover to expand each notification

**Mobile:**

- Only most recent notification shown
- Tap to expand notification content
- "View All" button to expand entire stack
- Swipe/tap to dismiss

### ✅ Commit & Transaction Notifications

1. **Book Purchase** → Seller gets 48-hour commitment notification
2. **Seller Commits** → Buyer notified delivery is in progress
3. **Missed Deadline** → Both parties notified of auto-cancellation
4. **Courier Pickup** → Buyer: "on the way", Seller: "pickup confirmed"

### ✅ Order Cancellation

- Buyers can cancel before courier pickup
- Automatic refund processing
- Real-time notifications to both parties

## 🚀 Usage

### Basic Integration

```tsx
// App.tsx (already integrated)
import NotificationStack from "./components/notifications/NotificationStack";
import NotificationInitializer from "./components/notifications/NotificationInitializer";

// In your app
<NotificationStack position="top-right" maxVisible={3} />
<NotificationInitializer />
```

### Triggering Notifications

```tsx
import {
  triggerCommitRequired,
  triggerSellerCommitted,
  triggerPickupConfirmed,
  triggerOrderCancellation,
} from "@/services/notificationTriggerService";

// When book is purchased
await triggerCommitRequired({
  id: orderId,
  buyer_id: buyerId,
  seller_id: sellerId,
  status: "pending_commit",
});

// When seller commits
await triggerSellerCommitted({
  id: orderId,
  buyer_id: buyerId,
  seller_id: sellerId,
  status: "committed",
});

// When courier picks up
await triggerPickupConfirmed(
  {
    id: orderId,
    buyer_id: buyerId,
    seller_id: sellerId,
    status: "picked_up",
  },
  "TRACK123",
);

// When order is cancelled
await triggerOrderCancellation(
  {
    id: orderId,
    buyer_id: buyerId,
    seller_id: sellerId,
    status: "cancelled",
  },
  "buyer",
  "Changed my mind",
);
```

### Order Cancellation Component

```tsx
import OrderCancellationButton from "@/components/orders/OrderCancellationButton";

// In your order details page
<OrderCancellationButton
  orderId={order.id}
  orderStatus={order.status}
  sellerId={order.seller_id}
  canCancel={order.status !== "picked_up"}
  onCancelled={() => {
    // Refresh order data
    refetchOrder();
  }}
/>;
```

## 🧪 Testing

Visit `/dev-dashboard` → "Tests" tab to access the notification demo:

1. **Test Different Notification Types** - Click buttons to trigger each notification type
2. **Test Desktop/Mobile Behavior** - Resize window to see responsive behavior
3. **Test Stacking** - Generate multiple notifications to see stacking
4. **Test Actions** - Click notification action buttons to test navigation

## 🔧 Configuration

### Notification Stack Options

```tsx
<NotificationStack
  position="top-right" | "top-center" | "bottom-right"
  maxVisible={3}           // How many notifications to show before stacking
  autoHideDelay={8000}     // Auto-hide delay in milliseconds
/>
```

### Priority Levels

- `urgent` - Red border, never auto-hide
- `high` - Orange border
- `medium` - Blue border
- `low` - Gray border

## 📊 State Management

Uses Zustand for notification state:

```tsx
import { useNotificationStore } from "@/stores/notificationStore";

const {
  notifications,
  unreadCount,
  addNotification,
  markAsRead,
  removeNotification,
  clearAllNotifications,
} = useNotificationStore();
```

## 🎨 Styling

All notifications use:

- Framer Motion for smooth animations
- Tailwind CSS for responsive styling
- Shadcn/UI components for consistency
- Custom priority color coding

## 🔄 Automated Systems

The notification system includes:

- **Automatic deadline checking** (every 5 minutes)
- **Auto-cancellation** for expired commitments
- **Persistent storage** with Zustand persist
- **Database integration** (fallback to in-memory if DB unavailable)

## 📱 Mobile Considerations

- Touch-friendly interaction areas (min 44px)
- Swipe gestures for dismissal
- Tap to expand behavior
- Stack management with "View All" button
- Responsive text sizing

## 🛠️ Integration Points

1. **Order Creation** → Call `triggerCommitRequired()`
2. **Seller Commit Action** → Call `triggerSellerCommitted()`
3. **Courier Pickup** → Call `triggerPickupConfirmed()`
4. **Order Cancellation** → Use `OrderCancellationButton` component
5. **Automated Checks** → `NotificationInitializer` handles background tasks

## ⚡ Performance

- Efficient state updates with Zustand
- Optimized re-renders with useCallback
- Limited notification history (50 max)
- Automatic cleanup of old notifications
- Lazy loading of notification content
