"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const THRESHOLD = 70;
const MAX_PULL = 120;

export function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef(0);
  const startY = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (!isStandalone) return;

    const setPullValue = (n: number) => {
      pullRef.current = n;
      setPull(n);
    };

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active.current) return;
      if (window.scrollY > 0) {
        active.current = false;
        setPullValue(0);
        return;
      }
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPullValue(0);
        return;
      }
      // Resistance curve so it feels rubbery
      const resisted = Math.min(MAX_PULL, delta * 0.5);
      setPullValue(resisted);
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      const distance = pullRef.current;
      if (distance >= THRESHOLD) {
        setRefreshing(true);
        setPullValue(THRESHOLD);
        router.refresh();
        setTimeout(() => {
          setRefreshing(false);
          setPullValue(0);
        }, 700);
      } else {
        setPullValue(0);
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);

    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [router, refreshing]);

  const progress = Math.min(1, pull / THRESHOLD);
  const rotation = progress * 360 + (refreshing ? 9999 : 0);
  const opacity = Math.min(1, pull / 30);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 8,
        height: pull + (refreshing ? 0 : 0),
        pointerEvents: "none",
        zIndex: 50,
        transition: active.current ? "none" : "height 0.25s ease-out",
        opacity,
      }}
    >
      <div
        className={refreshing ? "ptr-spin" : ""}
        style={{
          transform: refreshing ? undefined : `rotate(${rotation}deg)`,
          transition: active.current ? "none" : "transform 0.25s ease-out",
        }}
      >
        <svg width="28" height="28" viewBox="-15 -15 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="-9" r="5.4" fill="#f2e8d8" />
          <circle cx="8.6" cy="-2.8" r="5.4" fill="#f2e8d8" />
          <circle cx="5.3" cy="7.3" r="5.4" fill="#f2e8d8" />
          <circle cx="-5.3" cy="7.3" r="5.4" fill="#f2e8d8" />
          <circle cx="-8.6" cy="-2.8" r="5.4" fill="#f2e8d8" />
          <circle cx="0" cy="0" r="3.6" fill="#c97a4b" />
        </svg>
      </div>
    </div>
  );
}
