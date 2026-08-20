"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 64;
const MAX_PULL = 96;
const INDICATOR_SIZE = 44;

// Standalone PWA / Capacitor windows don't get the browser's native
// pull-to-refresh, so this reimplements the gesture: drag down from the
// very top of the page, past the threshold, to trigger router.refresh().
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const state = { startY: 0, pulling: false, distance: 0, refreshing: false };

    function onTouchStart(e: TouchEvent) {
      if (state.refreshing || window.scrollY > 0) return;
      state.startY = e.touches[0].clientY;
      state.pulling = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!state.pulling) return;
      const delta = e.touches[0].clientY - state.startY;

      if (delta <= 0 || window.scrollY > 0) {
        state.pulling = false;
        state.distance = 0;
        setDragging(false);
        setPullDistance(0);
        return;
      }

      e.preventDefault();
      state.distance = Math.min(delta * 0.5, MAX_PULL);
      setDragging(true);
      setPullDistance(state.distance);
    }

    function onTouchEnd() {
      if (!state.pulling) return;
      state.pulling = false;
      setDragging(false);

      if (state.distance >= PULL_THRESHOLD) {
        state.refreshing = true;
        setRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        router.refresh();
        window.setTimeout(() => {
          state.refreshing = false;
          setRefreshing(false);
          setPullDistance(0);
        }, 700);
      } else {
        setPullDistance(0);
      }

      state.distance = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [router]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div className="relative">
      <div
        className="absolute left-0 right-0 flex items-center justify-center"
        style={{
          top: -INDICATOR_SIZE,
          height: INDICATOR_SIZE,
          transform: `translateY(${pullDistance}px)`,
          opacity: progress,
          transition: dragging ? undefined : "transform 200ms ease, opacity 200ms ease",
        }}
      >
        <RefreshCw
          className={`size-5 text-violet ${refreshing ? "animate-spin" : ""}`}
          style={!refreshing ? { transform: `rotate(${progress * 360}deg)` } : undefined}
        />
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: dragging ? undefined : "transform 200ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
