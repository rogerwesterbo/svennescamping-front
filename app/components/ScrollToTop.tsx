import { useEffect } from "react";
import { useLocation } from "react-router";

interface ScrollToTopProps {
  /**
   * Whether to scroll to top on route change
   * @default true
   */
  enabled?: boolean;
  /**
   * Scroll behavior - 'auto' for instant, 'smooth' for animated
   * @default 'auto'
   */
  behavior?: "auto" | "smooth";
  /**
   * Delay in milliseconds before scrolling (useful for animations)
   * @default 0
   */
  delay?: number;
}

export function ScrollToTop({
  enabled = true,
  behavior = "auto",
  delay = 0,
}: ScrollToTopProps = {}) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior,
      });
    };

    if (delay > 0) {
      const timer = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timer);
    } else {
      scrollToTop();
    }
  }, [location.pathname, enabled, behavior, delay]);

  return null;
}
