# Toast System Migration Guide

This guide helps you migrate from the old minified toast implementation to the new enhanced Sonner-based toast system.

## What Changed

### Before (Old Implementation)

- Minified, hard-to-maintain code
- Limited customization options
- Basic toast types only
- No TypeScript support

### After (New Implementation)

- Clean, readable TypeScript code
- Rich customization options
- Specialized toast methods
- Enhanced accessibility
- Better animations and styling

## Migration Steps

### 1. Update Imports

**Old:**

```typescript
import { toast } from "sonner";
```

**New:**

```typescript
// For basic usage
import { toast } from "@/services/toastService";

// For hook-based usage
import { useToast } from "@/hooks/use-toast";
```

### 2. Basic Toast Usage

**Old:**

```typescript
toast.success("Success message");
toast.error("Error message");
```

**New (same API):**

```typescript
toast.success("Success message");
toast.error("Error message");
toast.warning("Warning message");
toast.info("Info message");
```

### 3. Enhanced Toast Options

**New Features:**

```typescript
// Toast with description and action
toast.success("File uploaded", {
  description: "Your document has been uploaded successfully",
  action: {
    label: "View File",
    onClick: () => console.log("Opening file..."),
  },
});

// Important toast with longer duration
toast.error("Critical error", {
  description: "This requires immediate attention",
  important: true,
  action: {
    label: "Fix Now",
    onClick: () => (window.location.href = "/admin"),
  },
});

// Toast with cancel option
toast.warning("Unsaved changes", {
  description: "You have unsaved changes that will be lost",
  action: {
    label: "Save",
    onClick: () => saveData(),
  },
  cancel: {
    label: "Discard",
    onClick: () => discardChanges(),
  },
});
```

### 4. Specialized Methods

The new system includes specialized methods for common use cases:

```typescript
// Payment success with order details
toast.paymentSuccess(299.99, "ORD-123456");

// Order creation notification
toast.orderCreated("ORD-789012");

// Network error with retry
toast.networkError();

// Quick save notification
toast.saveProgress("Changes saved automatically");

// Confirmation dialog
toast.confirmAction(
  "Delete this item?",
  () => deleteItem(),
  () => console.log("Cancelled"),
);
```

### 5. Promise-based Toasts

**New:**

```typescript
toast.promise(fetchData(), {
  loading: "Fetching data...",
  success: "Data loaded successfully",
  error: "Failed to load data",
});
```

### 6. Loading Toasts

**New:**

```typescript
const loadingId = toast.loading("Processing...");

// Later, dismiss and show success
toast.dismiss(loadingId);
toast.success("Processing complete!");
```

### 7. Custom Component Toasts

**New:**

```typescript
toast.custom(
  <div className="flex items-center space-x-3">
    <CustomIcon />
    <div>
      <p className="font-medium">Custom Toast</p>
      <p className="text-sm">With custom content</p>
    </div>
  </div>
);
```

## Configuration

### Toaster Component

The new `Toaster` component is automatically configured in `App.tsx`:

```typescript
import { Toaster } from "@/components/ui/sonner";

// In your app
<Toaster />
```

### Styling

Toasts now support:

- Rich colors and gradients
- Backdrop blur effects
- Dark mode support
- Reduced motion support
- Custom CSS variables from your design system

### Position

Default position is `bottom-right`, but you can customize:

```typescript
<Toaster position="top-center" />
```

## Testing

Visit `/toast-demo` (admin only) to test all toast functionality.

## Breaking Changes

1. **Custom toast styling**: Old CSS classes may need updates
2. **Position**: Default changed from `top-right` to `bottom-right`
3. **Duration**: Default durations may be different

## Benefits of Migration

1. **Better UX**: Enhanced animations and styling
2. **Accessibility**: Screen reader support and keyboard navigation
3. **Type Safety**: Full TypeScript support
4. **Maintainability**: Clean, documented code
5. **Extensibility**: Easy to add new toast types
6. **Performance**: Optimized rendering and animations

## Support

If you encounter issues during migration:

1. Check the toast demo page for examples
2. Review the TypeScript definitions in `@/services/toastService`
3. Test in different screen sizes and devices
