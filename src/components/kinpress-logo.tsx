import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const LOGO_DARK_SRC = "/kinpress-logo-mark-dark.svg";
const LOGO_LIGHT_SRC = "/kinpress-logo-mark-light.svg";

export const KINPRESS_LOGO_ASSETS = {
  dark: LOGO_DARK_SRC,
  light: LOGO_LIGHT_SRC,
} as const;

type ThemeAwareLogoProps = {
  className?: string;
  href?: string | null;
  markClassName?: string;
  priority?: boolean;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg" | "splash";
  tone?: "theme" | "onDark" | "onLight";
};

const sizeClassName = {
  sm: "kp-logo--sm",
  md: "kp-logo--md",
  lg: "kp-logo--lg",
  splash: "kp-logo--splash",
} as const;

const toneClassName = {
  theme: "kp-logo--theme",
  onDark: "kp-logo--on-dark",
  onLight: "kp-logo--on-light",
} as const;

export function ThemeAwareLogo({
  className,
  href = "/",
  markClassName,
  priority = false,
  showWordmark = true,
  size = "md",
  tone = "theme",
}: ThemeAwareLogoProps) {
  const content = (
    <>
      <span className={cn("kp-logo-mark", markClassName)} aria-hidden="true">
        <Image
          alt=""
          className="kp-logo-image kp-logo-image--dark"
          height={40}
          priority={priority}
          src={LOGO_DARK_SRC}
          width={40}
        />
        <Image
          alt=""
          className="kp-logo-image kp-logo-image--light"
          height={40}
          priority={priority}
          src={LOGO_LIGHT_SRC}
          width={40}
        />
      </span>
      {showWordmark ? (
        <span className="kp-logo-wordmark">
          KinPress
        </span>
      ) : null}
    </>
  );

  const logoClassName = cn(
    "kp-logo",
    sizeClassName[size],
    toneClassName[tone],
    className,
  );

  if (!href) {
    return <span className={logoClassName}>{content}</span>;
  }

  return (
    <Link aria-label="KinPress home" className={logoClassName} href={href}>
      {content}
    </Link>
  );
}

export function KinPressLogo(props: ThemeAwareLogoProps) {
  return <ThemeAwareLogo {...props} />;
}
