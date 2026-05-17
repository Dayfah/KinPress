import { KinPressLogo } from "@/components/kinpress-logo";
import { HeaderAuthActions } from "@/components/header-auth-actions";

type HomeHeroProps = {
  isLoggedIn: boolean;
};

function formatTodayHeading() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function HomeHero({ isLoggedIn }: HomeHeroProps) {
  return (
    <header className="min-w-0 space-y-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <KinPressLogo className="shrink-0" showWordmark />
          <p className="font-serif text-[clamp(1.75rem,6vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-ink">
            {formatTodayHeading()}
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <HeaderAuthActions isLoggedIn={isLoggedIn} linkClassName="inline-flex" />
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-ink/12 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-ink/75">
            Join KinPress for saved stories, comments, and your reading list.
          </p>
          <HeaderAuthActions
            className="w-full sm:w-auto"
            isLoggedIn={false}
            linkClassName="inline-flex flex-1 justify-center sm:flex-none"
          />
        </div>
      ) : null}
    </header>
  );
}
