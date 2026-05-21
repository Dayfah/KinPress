import { ThemeAwareLogo } from "@/components/kinpress-logo";

function currentDateLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function Loading() {
  return (
    <main className="kp-page-state flex min-h-screen items-center justify-center bg-bone px-6 text-ink">
      <section
        aria-label="Loading KinPress"
        className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center"
      >
        <ThemeAwareLogo href={null} priority size="splash" />
        <div className="h-px w-28 bg-ink/20" />
        <p className="text-xs font-black uppercase tracking-[0.28em] text-muted-brown">
          {currentDateLabel()}
        </p>
      </section>
    </main>
  );
}
