"use server";

import { revalidatePath } from "next/cache";
import { addComment, type Comment } from "@/lib/entries";

export async function postComment(
  entryId: string,
  author: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const cleanAuthor = author.trim().slice(0, 60);
  const cleanText = text.trim().slice(0, 1000);
  if (!cleanAuthor) return { ok: false, error: "Please enter your name." };
  if (!cleanText) return { ok: false, error: "Please write a comment." };

  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    author: cleanAuthor,
    text: cleanText,
  };

  const ok = await addComment(entryId, comment);
  if (!ok) return { ok: false, error: "That entry no longer exists." };

  revalidatePath("/");
  return { ok: true };
}
