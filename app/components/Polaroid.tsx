"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { postComment } from "../actions";
import type { Entry, Comment } from "@/lib/entries";

export function Polaroid({
  entry,
  caption,
  meta,
  tilt,
}: {
  entry: Entry;
  caption: string;
  meta: string;
  tilt: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("diary_commenter_name");
    if (stored) setName(stored);
  }, []);

  const comments: Comment[] = entry.comments ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postComment(entry.id, name, text);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      localStorage.setItem("diary_commenter_name", name.trim());
      setText("");
    });
  };

  return (
    <div className="polaroid-tilt mx-auto w-[88%] max-w-md sm:w-full" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className={`flipper ${flipped ? "flipped" : ""}`}>
        {/* FRONT */}
        <button
          type="button"
          aria-label="Flip to comments"
          onClick={() => setFlipped(true)}
          className="polaroid front block w-full text-left"
        >
          <div className="polaroid-photo">
            {entry.media.map((m, i) =>
              m.kind === "video" ? (
                <video key={i} src={m.url} controls playsInline onClick={(e) => e.stopPropagation()} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={m.url} alt="" loading="lazy" />
              )
            )}
          </div>
          {caption ? <div className="polaroid-caption">{caption}</div> : <div style={{ height: 18 }} />}
          <div className="polaroid-meta">{meta}</div>
        </button>

        {/* BACK */}
        <div className="polaroid back">
          <div className="polaroid-back-inner">
            <div className="polaroid-back-header">
              <span className="font-hand text-xl">love notes</span>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="polaroid-back-close font-hand"
                aria-label="Flip back"
              >
                ×
              </button>
            </div>

            <ul className="polaroid-comments">
              {comments.length === 0 ? (
                <li className="polaroid-empty">No notes yet — be the first.</li>
              ) : (
                comments.map((c) => (
                  <li key={c.id}>
                    <span className="comment-author">{c.author}:</span>{" "}
                    <span className="comment-text">{c.text}</span>
                  </li>
                ))
              )}
            </ul>

            <form onSubmit={handleSubmit} className="polaroid-form">
              <input
                type="text"
                placeholder="your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                className="polaroid-input"
              />
              <textarea
                ref={textRef}
                placeholder="leave a note…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                rows={2}
                required
                className="polaroid-input"
              />
              {error && <p className="polaroid-error">{error}</p>}
              <button type="submit" disabled={pending} className="polaroid-submit">
                {pending ? "sending…" : "send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
