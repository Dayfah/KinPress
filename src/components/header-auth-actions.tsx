"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

type HeaderAuthActionsProps = {
  isLoggedIn: boolean;
  className?: string;
  linkClassName?: string;
  variant?: "header" | "drawer";
  /** Wrap links so mobile sheet closes on navigation. */
  wrapLink?: (child: ReactElement) => ReactNode;
};

export function HeaderAuthActions({
  isLoggedIn,
  className,
  linkClassName,
  variant = "header",
  wrapLink = (child) => child,
}: HeaderAuthActionsProps) {
  const isDrawer = variant === "drawer";

  const ghost = cn(
    isDrawer
      ? "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-[15px] font-semibold text-white/90 transition hover:bg-white/10"
      : "kp-auth-link-ghost text-sm",
    linkClassName,
  );
  const primary = cn(
    isDrawer
      ? "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-heritage px-4 text-[15px] font-semibold text-white transition hover:bg-heritage/90"
      : "kp-auth-link-primary text-xs",
    linkClassName,
  );
  const signOutClass = cn(
    isDrawer
      ? "min-h-12 w-full rounded-xl border-white/20 text-[15px] font-semibold text-white/90 hover:border-white/35 hover:bg-white/10"
      : undefined,
    linkClassName,
  );

  if (!isLoggedIn) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          isDrawer && "w-full flex-col gap-2.5",
          className,
        )}
      >
        {wrapLink(
          <Link className={ghost} href="/login">
            Log in
          </Link>,
        )}
        {wrapLink(
          <Link className={primary} href="/signup">
            Join
          </Link>,
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        isDrawer && "w-full flex-col gap-2.5",
        className,
      )}
    >
      {wrapLink(
        <Link className={ghost} href="/profile">
          Profile
        </Link>,
      )}
      {wrapLink(
        <Link className={ghost} href="/saved">
          Saved
        </Link>,
      )}
      <SignOutButton className={signOutClass} label="Sign out" />
    </div>
  );
}
