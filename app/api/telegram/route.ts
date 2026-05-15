import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import {
  appendEntry,
  deleteEntry,
  deleteEntryByBotReply,
  setBotReplyId,
  updateEntryText,
  type Entry,
  type Media,
} from "@/lib/entries";
import { downloadFile, sendMessage, type TgMessage, type TgUpdate } from "@/lib/telegram";
import { sendPushToAll } from "@/lib/subscriptions";

const babyName = process.env.BABY_NAME ?? "Baby Hank";

export const runtime = "nodejs";
export const maxDuration = 60;

function allowedUserIds(): Set<number> {
  return new Set(
    (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n))
  );
}

function allowedChatId(): number | null {
  const v = process.env.TELEGRAM_ALLOWED_CHAT_ID;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function entryIdFor(chatId: number, messageId: number) {
  return `${chatId}-${messageId}`;
}

function isAuthorized(msg: TgMessage): boolean {
  const chatOk = allowedChatId();
  if (chatOk !== null && msg.chat.id !== chatOk) return false;
  const allowed = allowedUserIds();
  if (allowed.size > 0 && (!msg.from || !allowed.has(msg.from.id))) return false;
  return true;
}

async function handleNewMessage(msg: TgMessage): Promise<void> {
  const text = (msg.caption ?? msg.text ?? "").trim();

  if (text.startsWith("/delete")) {
    const target = msg.reply_to_message;
    if (!target) {
      await sendMessage(msg.chat.id, "Reply to the message you want to delete with /delete.", msg.message_id);
      return;
    }
    const directId = entryIdFor(msg.chat.id, target.message_id);
    console.log(`[delete] reply target msg_id=${target.message_id} entryId=${directId}`);
    let ok = await deleteEntry(directId);
    if (!ok) {
      console.log(`[delete] no direct match, trying botReplyId=${target.message_id}`);
      ok = await deleteEntryByBotReply(msg.chat.id, target.message_id);
    }
    console.log(`[delete] result=${ok}`);
    await sendMessage(
      msg.chat.id,
      ok ? "Deleted ✓" : "Couldn't find that entry — reply to the original photo/note (or my Saved ✓ message).",
      msg.message_id
    );
    return;
  }

  if (text.startsWith("/")) return;

  const media: Media[] = [];

  if (msg.photo && msg.photo.length > 0) {
    const largest = msg.photo.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    const { buffer, contentType, ext } = await downloadFile(largest.file_id);
    const blob = await put(`media/${msg.date}-${largest.file_id}.${ext}`, Buffer.from(buffer), {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });
    media.push({ url: blob.url, kind: "photo", width: largest.width, height: largest.height });
  }

  if (msg.video) {
    const { buffer, contentType, ext } = await downloadFile(msg.video.file_id);
    const blob = await put(`media/${msg.date}-${msg.video.file_id}.${ext}`, Buffer.from(buffer), {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });
    media.push({ url: blob.url, kind: "video", width: msg.video.width, height: msg.video.height });
  }

  if (media.length === 0 && !text) return;

  const entry: Entry = {
    id: entryIdFor(msg.chat.id, msg.message_id),
    ts: msg.date * 1000,
    author: msg.from?.first_name ?? msg.from?.username,
    text,
    media,
  };

  await appendEntry(entry);
  const botReplyId = await sendMessage(msg.chat.id, "Saved ✓", msg.message_id);
  if (botReplyId) await setBotReplyId(entry.id, botReplyId);

  const author = msg.from?.first_name;
  const preview = text ? text.slice(0, 80) : media.length > 0 ? "shared a new photo" : "added a note";
  try {
    await sendPushToAll({
      title: `${babyName}'s diary`,
      body: author ? `${author}: ${preview}` : preview,
      url: "/",
      tag: `entry-${entry.id}`,
    });
  } catch (err) {
    console.error("push fanout error:", err);
  }
}

async function handleEditedMessage(msg: TgMessage): Promise<void> {
  const text = (msg.caption ?? msg.text ?? "").trim();
  if (text.startsWith("/")) return;
  const ok = await updateEntryText(entryIdFor(msg.chat.id, msg.message_id), text);
  if (ok) {
    await sendMessage(msg.chat.id, "Updated ✓", msg.message_id);
  }
}

export async function POST(req: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expected) return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const newMsg = update.message ?? update.channel_post;
  const editedMsg = update.edited_message ?? update.edited_channel_post;
  const msg = newMsg ?? editedMsg;
  if (!msg) return NextResponse.json({ ok: true });

  if (!isAuthorized(msg)) {
    if (newMsg) {
      await sendMessage(msg.chat.id, "Sorry — you're not on the post list for this diary.", msg.message_id);
    }
    return NextResponse.json({ ok: true });
  }

  try {
    if (editedMsg) {
      await handleEditedMessage(editedMsg);
    } else if (newMsg) {
      await handleNewMessage(newMsg);
    }
  } catch (err) {
    console.error("telegram handler error:", err);
    try {
      await sendMessage(msg.chat.id, "Something went wrong — try again?", msg.message_id);
    } catch {}
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST webhook only" });
}
