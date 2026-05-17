import Link from "next/link";

import { cn } from "@/lib/utils";

type KinPressLogoProps = {
  className?: string;
  href?: string;
  showWordmark?: boolean;
};

export function KinPressLogo({
  className,
  href = "/",
  showWordmark = true,
}: KinPressLogoProps) {
  const content = (
    <>
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-heritage/12 text-heritage sm:size-10"
      >
        <svg className="size-5 sm:size-6" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 10h6.5c4.2 0 7 2.4 7 6.1 0 2.5-1.2 4.3-3.2 5.2L26 30h-4.6l-4.4-7.4H15.2V30H11V10zm4.2 3.6V18h2.1c2.1 0 3.2-1 3.2-2.7 0-1.6-1.1-2.7-3.2-2.7h-2.1z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showWordmark ? (
        <span className="min-w-0 font-serif text-xl font-bold leading-none tracking-tight text-inherit sm:text-2xl">
          KinPress
        </span>
      ) : null}
    </>
  );

  return (
    <Link
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-2.5 text-ink transition hover:opacity-90 [&_span]:text-inherit",
        className,
      )}
      href={href}
    >
      {content}
    </Link>
  );
}
