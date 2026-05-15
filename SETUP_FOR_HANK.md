# Baby Hank's Diary — Setup Guide

This site is a private, one-way "diary" for your kid. You and your wife post photos + notes to a Telegram group; everything you send appears on the website. Family and friends can view it and leave little comments on photos.

Everything on the **technical side** (hosting, code, deployment) is handled. You only need to do a few Telegram steps and send back some IDs/numbers so we can wire it up.

---

## Step 1 — Make the Telegram bot (~3 min)

The bot is what listens to your group and saves messages to the site.

1. On your phone, open **Telegram** and search for **`@BotFather`**. Open the chat with it.
2. Send: `/newbot`
3. BotFather asks for a name — call it something like **`Baby Hank Diary Bot`**.
4. Then it asks for a username — must end in `bot`, e.g. **`BabyHankDiaryBot`** (if taken, try another).
5. BotFather replies with a long **API token** that looks like:
   ```
   8737913982:AAF4zqGG62qv_Z9b...
   ```
   **Copy and save this token.** This is the most important thing — keep it private (anyone with it can act as your bot).

### Turn off the bot's privacy mode

By default the bot only sees commands starting with `/`. We need it to see all messages in the group.

1. Send BotFather: `/mybots`
2. Tap your bot name in the list.
3. Tap **Bot Settings** → **Group Privacy** → **Turn off**.

---

## Step 2 — Make the family group (~2 min)

1. In Telegram, create a new group.
2. Add **yourself**, **your wife**, and **your bot** (search for its username from Step 1).
3. Name the group whatever you want — "Hank's Diary" works.
4. Send any message in the group ("hi"). Have your wife send one too. This is so we can find your user IDs.

---

## Step 3 — Get the chat ID + user IDs (~2 min)

This sounds technical but it's literally one click and copy-paste.

### Get the group chat ID

Open this URL in any browser, replacing `<YOUR_TOKEN>` with the token from Step 1:

```
https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

You'll see JSON. Look for a line like:
```
"chat":{"id":-5082355387,"title":"Hank's Diary",...
```

The **chat ID** is the negative number (e.g. `-5082355387`). **Copy it.**

### Get your user ID + your wife's

In the same JSON, look for `"from":{"id":...,"first_name":"Hank"}` entries. The `id` number is each person's Telegram user ID. Find yours and your wife's.

**Easier alternative:** have each of you DM the bot **`@userinfobot`** (it's a different bot — just search and send "hi"). It instantly replies with your user ID.

---

## Step 4 — Send everything back

Send this list back so we can plug it into the site:

| Thing | Value |
|---|---|
| Telegram bot token | `8737913982:AAF...` |
| Group chat ID (negative number) | `-...` |
| Your Telegram user ID | `...` |
| Your wife's Telegram user ID | `...` |
| Baby's name as it should appear on the site | `Baby Hank` |
| Site password (optional) | leave blank if you want anyone with the link to view, otherwise pick a word your family can share |
| Tagline under the title (optional) | default is "Moments and Milestones" |

We'll plug these in and send you back a URL.

---

## Step 5 — Once it's live, how it works

### Posting
- In your family Telegram group, just **send a photo, video, or note**. The bot replies "Saved ✓" and it appears on the site in seconds.
- Add a caption to a photo → that becomes the caption on the site.
- Text-only messages appear as styled sticky notes / notepad paper on the site.

### Editing
- Long-press your message in Telegram → **Edit** → save. The site updates automatically.

### Deleting
- Reply to your post (or to the bot's "Saved ✓" message) with **`/delete`**. The bot removes it from the site.

### Family viewing
- Share the site URL with anyone you want.
- Family can tap a photo → it flips around → leave a little note. They'll be asked for their name once and it's remembered.

### Phone home-screen install (recommended for family)
On iPhone:
1. Open the site in **Safari**
2. Tap the share icon → **Add to Home Screen**
3. Open the diary from the home-screen icon
4. A "Get notified for new posts" button appears — tap and allow notifications
5. They'll get a push notification on their phone each time you post

---

## Things to know

- **Image quality:** Telegram compresses photos by default. Send them as a regular photo for normal quality. (Sending "as file" preserves full resolution but takes longer.)
- **Adding a third poster later (e.g. a grandparent):** just have them send a message, grab their user ID, and we'll add it to the allowlist.
- **Bot is in your group, not yours alone** — if the bot ever gets removed from the group, posts stop working until you re-add it.

Any issues, just text me.
