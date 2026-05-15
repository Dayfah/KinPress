import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const ARTICLE_STATUSES = ["draft", "review", "published", "archived"] as const;
const MANAGER_ROLES = new Set(["admin", "editor"]);

type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

type AdminArticlePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    slug?: string;
  }>;
};

type Profile = {
  display_name: string | null;
  username: string | null;
  role: string | null;
};

type Category = {
  id: string | number;
  name: string | null;
  slug: string | null;
};

function textField(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function optionalTextField(formData: FormData, name: string) {
  const value = textField(formData, name);
  return value.length > 0 ? value : null;
}

function readStatus(formData: FormData): ArticleStatus | null {
  const status = textField(formData, "status");

  if (ARTICLE_STATUSES.includes(status as ArticleStatus)) {
    return status as ArticleStatus;
  }

  return null;
}

function readTags(formData: FormData) {
  return textField(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function canManageArticles(profile: Profile | null) {
  return Boolean(profile?.role && MANAGER_ROLES.has(profile.role));
}

function profileAuthorName(profile: Profile | null, email?: string) {
  return (
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    email ||
    "KinPress editor"
  );
}

function messageRedirect(message: string) {
  redirect(`/admin/articles/new?error=${encodeURIComponent(message)}`);
}

async function loadCurrentProfile() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, username, role")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  return { supabase, user, profile };
}

async function createArticle(formData: FormData) {
  "use server";

  const { supabase, user, profile } = await loadCurrentProfile();

  if (!canManageArticles(profile)) {
    messageRedirect("You do not have permission.");
  }

  const title = textField(formData, "title");
  const slug = textField(formData, "slug");
  const body = textField(formData, "body");
  const status = readStatus(formData);

  if (!title || !slug || !body || !status) {
    messageRedirect("Title, slug, body, and status are required.");
  }

  const categoryId = optionalTextField(formData, "category_id");
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const { error } = await supabase.from("articles").insert({
    title,
    slug,
    subtitle: optionalTextField(formData, "subtitle"),
    summary: optionalTextField(formData, "summary"),
    body,
    category_id: categoryId,
    tags: readTags(formData),
    cover_image_url: optionalTextField(formData, "cover_image_url"),
    is_premium: formData.get("is_premium") === "on",
    is_featured: formData.get("is_featured") === "on",
    status,
    published_at: publishedAt,
    author_id: user.id,
    author_name: profileAuthorName(profile, user.email),
  });

  if (error) {
    messageRedirect(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/articles/new");
  redirect(`/admin/articles/new?saved=1&slug=${encodeURIComponent(slug)}`);
}

export default async function NewArticlePage({
  searchParams,
}: AdminArticlePageProps) {
  const params = await searchParams;
  const { supabase, profile } = await loadCurrentProfile();

  if (!canManageArticles(profile)) {
    return (
      <main className="min-h-screen px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-3xl border border-ink/15 bg-bone p-8 shadow-[0_24px_80px_-48px_rgba(17,17,17,0.7)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-heritage">
            Admin access
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
            You do not have permission.
          </h1>
        </section>
      </main>
    );
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<Category[]>();

  if (categoriesError) {
    throw new Error(`Unable to load categories: ${categoriesError.message}`);
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto grid max-w-6xl gap-8">
        <header className="border-b border-ink pb-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-heritage">
            Admin / Articles
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end">
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl">
              Create a KinPress story.
            </h1>
            <p className="text-base leading-7 text-ink/70">
              Draft, review, or publish editorial work with clean metadata for
              the homepage, archive, and article pages.
            </p>
          </div>
        </header>

        {params?.saved ? (
          <p className="border border-deep-green/25 bg-deep-green/10 px-4 py-3 text-sm font-semibold text-deep-green">
            Article saved{params.slug ? `: ${params.slug}` : "."}
          </p>
        ) : null}

        {params?.error ? (
          <p className="border border-heritage/25 bg-heritage/10 px-4 py-3 text-sm font-semibold text-heritage">
            {params.error}
          </p>
        ) : null}

        <form
          action={createArticle}
          className="grid gap-8 border border-ink/15 bg-bone p-5 shadow-[0_24px_80px_-48px_rgba(17,17,17,0.7)] sm:p-8"
        >
          <section className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Title
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="title"
                placeholder="A headline with weight"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Slug
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="slug"
                placeholder="story-slug"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-2">
              Subtitle
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="subtitle"
                placeholder="A sharp deck for the story"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-2">
              Summary
              <textarea
                className="min-h-28 border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="summary"
                placeholder="Short summary for article cards and previews"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-2">
              Body
              <textarea
                className="min-h-72 border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="body"
                placeholder="Write the full article body"
                required
              />
            </label>
          </section>

          <section className="grid gap-5 border-t border-ink/15 pt-6 lg:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Category
              <select
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="category_id"
              >
                <option value="">Choose a category</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name ?? category.slug ?? category.id}
                  </option>
                ))}
              </select>
              {(categories ?? []).length === 0 ? (
                <span className="text-xs font-normal normal-case tracking-normal text-ink/60">
                  No active categories found yet.
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Tags
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="tags"
                placeholder="history, politics, arts"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Status
              <select
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                defaultValue="draft"
                name="status"
                required
              >
                {ARTICLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-3">
              Cover image URL
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="cover_image_url"
                placeholder="https://..."
                type="url"
              />
            </label>
          </section>

          <section className="flex flex-col gap-4 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
                <input className="size-4 accent-heritage" name="is_premium" type="checkbox" />
                Premium
              </label>
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
                <input className="size-4 accent-heritage" name="is_featured" type="checkbox" />
                Featured
              </label>
            </div>

            <button
              className="inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-bone transition hover:bg-heritage"
              type="submit"
            >
              Save article
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}
