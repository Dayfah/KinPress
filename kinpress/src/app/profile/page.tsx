export default function ProfilePage() {
  return (
    <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
      <aside className="rounded-[2rem] bg-neutral-950 p-8 text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-300 text-3xl font-black text-neutral-950">
          KP
        </div>
        <h1 className="mt-6 text-3xl font-black">Reader profile</h1>
        <p className="mt-3 text-neutral-300">Manage your KinPress account, saved stories, and comments.</p>
      </aside>
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-neutral-950">Account details</h2>
        <dl className="mt-6 grid gap-5">
          <div className="rounded-2xl border border-neutral-200 p-5">
            <dt className="text-sm font-semibold text-neutral-500">Display name</dt>
            <dd className="mt-1 font-bold text-neutral-950">KinPress Reader</dd>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5">
            <dt className="text-sm font-semibold text-neutral-500">Membership</dt>
            <dd className="mt-1 font-bold text-neutral-950">Community member</dd>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5">
            <dt className="text-sm font-semibold text-neutral-500">Saved stories</dt>
            <dd className="mt-1 font-bold text-neutral-950">2 articles</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
