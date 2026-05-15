"use client";

import { useState, useEffect } from "react";

type State =
  | "loading"
  | "unsupported"
  | "needs-install"
  | "denied"
  | "subscribed"
  | "ready"
  | "pending"
  | "error";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if ((window.navigator as unknown as { standalone?: boolean }).standalone) return true;
  return false;
}

function isiOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function EnableNotifications() {
  const [state, setState] = useState<State>("loading");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!vapidKey) {
        setState("unsupported");
        return;
      }
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (isiOS() && !isStandalone()) {
        setState("needs-install");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (cancelled) return;
        setState(existing ? "subscribed" : "ready");
      } catch {
        if (!cancelled) setState("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vapidKey]);

  const enable = async () => {
    if (!vapidKey) return;
    setState("pending");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      });
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("subscribed");
    } catch {
      setState("error");
    }
  };

  if (state === "loading" || state === "unsupported" || state === "subscribed") return null;

  const wrap = (children: React.ReactNode) => (
    <div className="notify-card">{children}</div>
  );

  if (state === "needs-install") {
    return wrap(
      <p className="font-hand">
        Want a ping when there's a new post? Tap the share icon and choose <em>Add to Home Screen</em>, then open the diary from your home screen.
      </p>
    );
  }
  if (state === "denied") {
    return wrap(
      <p className="font-hand">
        Notifications are blocked. To turn them on, open Settings → Notifications → this app.
      </p>
    );
  }
  return wrap(
    <button onClick={enable} disabled={state === "pending"} className="notify-button font-hand">
      {state === "pending" ? "enabling…" : state === "error" ? "try again" : "Get notified for new posts"}
    </button>
  );
}
