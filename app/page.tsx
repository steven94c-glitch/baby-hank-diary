import { readEntries, type Entry } from "@/lib/entries";
import { Polaroid } from "./components/Polaroid";
import { EnableNotifications } from "./components/EnableNotifications";

export const dynamic = "force-dynamic";

const babyName = process.env.BABY_NAME ?? "Baby Hank";
const tagline = process.env.TAGLINE ?? "Moments and Milestones";
const TZ = "America/New_York";

function parseAliases(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [k, v] = pair.split("=").map((s) => s.trim());
    if (k && v) out[k.toLowerCase()] = v;
  }
  return out;
}
const AUTHOR_ALIASES = parseAliases(process.env.AUTHOR_ALIASES);

function displayAuthor(name?: string): string | undefined {
  if (!name) return undefined;
  return AUTHOR_ALIASES[name.toLowerCase()] ?? name;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TZ,
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function tiltFor(id: string): number {
  // -3 to +3 degrees, deterministic
  return (hash(id) % 7) - 3;
}

function noteVariantFor(id: string): "sticky" | "notepad" | "notecard" {
  const variants = ["sticky", "notepad", "notecard"] as const;
  return variants[hash(id) % variants.length];
}

function PolaroidEntry({ e }: { e: Entry }) {
  const tilt = tiltFor(e.id);
  const author = displayAuthor(e.author);
  const meta = `${author ? `${author} · ` : ""}${formatTime(e.ts)}`;
  return <Polaroid entry={e} caption={e.text} meta={meta} tilt={tilt} />;
}

function NoteEntry({ e }: { e: Entry }) {
  const tilt = tiltFor(e.id);
  const variant = noteVariantFor(e.id);
  return (
    <div
      className={`mx-auto w-[86%] max-w-sm sm:w-full ${variant}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="whitespace-pre-wrap">{e.text}</div>
      <span className="note-meta">
        {displayAuthor(e.author) ? `— ${displayAuthor(e.author)}, ` : "— "}
        {formatTime(e.ts)}
      </span>
    </div>
  );
}

export default async function Home() {
  const entries = await readEntries();

  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = formatDate(e.ts);
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-24 sm:px-10 sm:pt-28">
      <header className="mb-16 text-center">
        <h1 className="daisy-title uppercase text-7xl sm:text-8xl">
          {babyName.split(" ").map((part, i) => (
            <span key={i} className="block">
              {part}
            </span>
          ))}
        </h1>
        <p
          className="mt-6 font-hand text-xl"
          style={{ color: "var(--cornstalk-deep)" }}
        >
          {tagline}
        </p>
      </header>

      <EnableNotifications />

      {entries.length === 0 ? (
        <p className="mt-24 text-center font-hand text-xl" style={{ color: "var(--muted)" }}>
          No entries yet — send a photo or note from the Telegram group.
        </p>
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {Array.from(groups.entries()).map(([day, dayEntries]) => (
            <section key={day}>
              <h2 className="day-heading mb-6 sm:mb-8">{day}</h2>
              <ul className="space-y-10 sm:space-y-12">
                {dayEntries.map((e) => (
                  <li key={e.id}>
                    {e.media.length > 0 ? <PolaroidEntry e={e} /> : <NoteEntry e={e} />}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
