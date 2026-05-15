import { NextResponse } from "next/server";
import { sendPushToAll, readSubscriptions } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET() {
  const subs = await readSubscriptions();
  const result = await sendPushToAll({
    title: "Test push",
    body: "If you see this, notifications are working.",
    url: "/",
    tag: "test-push",
  });
  return NextResponse.json({
    config: {
      hasPublic: !!process.env.VAPID_PUBLIC_KEY,
      hasPrivate: !!process.env.VAPID_PRIVATE_KEY,
      hasPublicNext: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      publicMatches:
        process.env.VAPID_PUBLIC_KEY &&
        process.env.VAPID_PUBLIC_KEY === process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      hasSubject: !!process.env.VAPID_SUBJECT,
    },
    subscriptions: subs.length,
    result,
  });
}
