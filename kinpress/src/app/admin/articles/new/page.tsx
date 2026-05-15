export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Admin</p>
      <h1 className="mt-3 text-4xl font-black text-neutral-950">Draft a new article</h1>
      <form className="mt-8 grid gap-5">
        <label className="text-sm font-semibold text-neutral-700">
          Title
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            placeholder="Article headline"
          />
        </label>
        <label className="text-sm font-semibold text-neutral-700">
          Category
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            placeholder="Culture"
          />
        </label>
        <label className="text-sm font-semibold text-neutral-700">
          Excerpt
          <textarea
            rows={4}
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            placeholder="Short summary for article cards"
          />
        </label>
        <label className="text-sm font-semibold text-neutral-700">
          Body
          <textarea
            rows={10}
            className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            placeholder="Write the story"
          />
        </label>
        <button
          type="button"
          className="rounded-2xl bg-neutral-950 px-5 py-3 font-bold text-white transition hover:bg-neutral-800"
        >
          Save draft
        </button>
      </form>
    </div>
  );
}
