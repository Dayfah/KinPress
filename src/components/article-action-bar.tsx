"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Headphones, MessageCircle, Share2 } from "lucide-react";

type ArticleActionBarProps = {
  commentCount?: number;
  excerpt: string;
  path: string;
  title: string;
};

export function ArticleActionBar({
  commentCount = 0,
  excerpt,
  path,
  title,
}: ArticleActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const url = useMemo(() => {
    if (typeof window === "undefined") {
      return path;
    }
    return new URL(path, window.location.origin).toString();
  }, [path]);

  async function shareArticle() {
    if (navigator.share) {
      await navigator.share({ title, text: excerpt, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function listen() {
    if (!("speechSynthesis" in window)) {
      void copyLink();
      return;
    }

    if (listening) {
      window.speechSynthesis.cancel();
      setListening(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${title}. ${excerpt}`);
    utterance.onend = () => setListening(false);
    setListening(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="kp-article-actions" aria-label="Article actions">
      <button className="kp-article-action" onClick={shareArticle} type="button">
        <Share2 className="size-4" />
        Share
      </button>
      <button
        aria-pressed={listening}
        className="kp-article-action"
        onClick={listen}
        type="button"
      >
        <Headphones className="size-4" />
        {listening ? "Stop" : "Listen"}
      </button>
      <button className="kp-article-action" onClick={copyLink} type="button">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Article link copied." : ""}
      </span>
      <span className="kp-article-action" aria-label={`${commentCount} comments`}>
        <MessageCircle className="size-4" />
        {commentCount} comments
      </span>
    </div>
  );
}
