import Image from "next/image";
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
  return (
    <Link
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-2.5 text-ink transition hover:opacity-90",
        className,
      )}
      href={href}
    >
      <Image
        alt=""
        className="size-9 shrink-0 dark:brightness-0 dark:invert sm:size-10"
        height={40}
        priority
        src="/kinpress-logo.svg"
        width={40}
      />
      {showWordmark ? (
        <span className="min-w-0 font-serif text-xl font-bold leading-none tracking-tight text-inherit sm:text-2xl">
          KinPress
        </span>
      ) : null}
    </Link>
  );
}
