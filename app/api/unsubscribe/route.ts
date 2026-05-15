import { NextRequest, NextResponse } from "next/server";
import { removeSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { endpoint?: string };
  try {
    body = (await req.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body?.endpoint) return NextResponse.json({ ok: false }, { status: 400 });
  await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
