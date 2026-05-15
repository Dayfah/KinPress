import Link from "next/link";

import { articles, categories } from "@/lib/utils";

export default function AdminPage() {
  return (
    <div>
      <div className="flex flex-col gap-5 rounded-[2rem] bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Admin</p>
          <h1 className="mt-3 text-4xl font-black text-neutral-950">Editorial dashboard</h1>
          <p className="mt-4 max-w-2xl text-neutral-600">
            Review publishing metrics and draft new KinPress articles.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-full bg-neutral-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          New article
        </Link>
      </div>
      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Published articles</p>
          <p className="mt-3 text-4xl font-black text-neutral-950">{articles.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Categories</p>
          <p className="mt-3 text-4xl font-black text-neutral-950">{categories.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Comments</p>
          <p className="mt-3 text-4xl font-black text-neutral-950">18</p>
        </div>
      </section>
    </div>
  );
}
