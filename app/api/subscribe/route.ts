import { NextRequest, NextResponse } from "next/server";
import { addSubscription, type StoredSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: StoredSubscription;
  try {
    body = (await req.json()) as StoredSubscription;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ ok: false, error: "invalid subscription" }, { status: 400 });
  }
  await addSubscription({ endpoint: body.endpoint, keys: body.keys });
  return NextResponse.json({ ok: true });
}
