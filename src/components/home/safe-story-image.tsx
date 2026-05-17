"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type SafeStoryImageProps = {
  src: string | null;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  fallbackLabel?: string;
};

export function SafeStoryImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  fallbackLabel = "KinPress",
}: SafeStoryImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden={!alt}
        className={cn(
          "flex items-center justify-center bg-charcoal/15 text-center",
          wrapperClassName,
        )}
      >
        {alt ? (
          <span className="sr-only">{alt}</span>
        ) : (
          <span className="px-3 font-serif text-sm leading-snug text-ink/55">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}
