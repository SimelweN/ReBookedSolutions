// Route preloader for faster navigation
// Preloads common routes to eliminate loading screens

const preloadedRoutes = new Set<string>();

export const preloadRoute = async (routePath: string) => {
  if (preloadedRoutes.has(routePath)) return;

  try {
    switch (routePath) {
      case "/":
        await import("../pages/Index");
        break;
      case "/login":
        await import("../pages/Login");
        break;
      case "/register":
        await import("../pages/Register");
        break;
      case "/books":
        await import("../pages/BookListing");
        break;
      case "/profile":
        await import("../pages/Profile");
        break;
      case "/create-listing":
        await import("../pages/CreateListing");
        break;
      case "/cart":
        await import("../pages/Cart");
        break;
      default:
        return;
    }
    preloadedRoutes.add(routePath);
    console.log(`✅ Preloaded route: ${routePath}`);
  } catch (error) {
    console.warn(`⚠️ Failed to preload route ${routePath}:`, error);
  }
};

// Preload critical routes on app start
export const preloadCriticalRoutes = () => {
  setTimeout(() => {
    preloadRoute("/");
    preloadRoute("/login");
    preloadRoute("/books");
  }, 100);

  setTimeout(() => {
    preloadRoute("/register");
    preloadRoute("/profile");
    preloadRoute("/cart");
  }, 500);
};

// Preload on hover/focus for instant navigation
export const preloadOnHover = (href: string) => {
  preloadRoute(href);
};
