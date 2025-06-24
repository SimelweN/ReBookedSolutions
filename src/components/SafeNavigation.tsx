import React, { startTransition } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Safe Navigation Hook that wraps navigation with startTransition
 * to prevent Suspense errors during route changes
 */
export const useSafeNavigate = () => {
  const navigate = useNavigate();

  const safeNavigate = React.useCallback(
    (to: string | number, options?: { replace?: boolean; state?: any }) => {
      startTransition(() => {
        if (typeof to === "string") {
          navigate(to, options);
        } else {
          navigate(to);
        }
      });
    },
    [navigate],
  );

  return safeNavigate;
};

/**
 * Safe Link Component that uses startTransition for navigation
 */
interface SafeLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  state?: any;
  onClick?: (e: React.MouseEvent) => void;
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  to,
  children,
  className,
  replace,
  state,
  onClick,
  ...props
}) => {
  const navigate = useSafeNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
    }

    // Use startTransition for safe navigation
    navigate(to, { replace, state });
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

/**
 * Higher-order component to wrap navigation actions with startTransition
 */
export function withSafeNavigation<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
): React.ComponentType<T> {
  return function SafeNavigationComponent(props: T) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}

export default SafeNavigation;
