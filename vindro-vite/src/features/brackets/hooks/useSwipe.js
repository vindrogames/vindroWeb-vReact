// Custom hook for handling swipe gestures
import { useRef, useCallback } from 'react';

export const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  }, []);

  const handleSwipe = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50; // Minimum distance of 50px
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return { handleTouchStart, handleTouchEnd };
};
