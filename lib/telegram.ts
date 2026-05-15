const TG_API = "https://api.telegram.org";

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return t;
}

export type TgPhotoSize = { file_id: string; width: number; height: number; file_size?: number };
export type TgVideo = { file_id: string; width: number; height: number; duration: number; mime_type?: string };
export type TgUser = { id: number; first_name?: string; username?: string };
export type TgChat = { id: number; type: string; title?: string };
export type TgMessage = {
  message_id: number;
  date: number;
  edit_date?: number;
  from?: TgUser;
  chat: TgChat;
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
  video?: TgVideo;
  reply_to_message?: TgMessage;
};
export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  channel_post?: TgMessage;
  edited_message?: TgMessage;
  edited_channel_post?: TgMessage;
};

export async function getFilePath(file_id: string): Promise<string> {
  const res = await fetch(`${TG_API}/bot${token()}/getFile?file_id=${encodeURIComponent(file_id)}`);
  if (!res.ok) throw new Error(`getFile failed: ${res.status}`);
  const json = (await res.json()) as { ok: boolean; result?: { file_path?: string } };
  if (!json.ok || !json.result?.file_path) throw new Error("getFile returned no file_path");
  return json.result.file_path;
}

export async function downloadFile(file_id: string): Promise<{ buffer: ArrayBuffer; contentType: string; ext: string }> {
  const path = await getFilePath(file_id);
  const url = `${TG_API}/file/bot${token()}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : "bin";
  return { buffer, contentType, ext };
}

export async function sendMessage(
  chat_id: number,
  text: string,
  reply_to?: number
): Promise<number | undefined> {
  try {
    const res = await fetch(`${TG_API}/bot${token()}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text,
        reply_to_message_id: reply_to,
        disable_notification: true,
      }),
    });
    const json = (await res.json()) as { ok: boolean; result?: { message_id: number } };
    return json.result?.message_id;
  } catch {
    return undefined;
  }
}
