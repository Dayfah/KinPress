import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { estimateReadingTime, slugifyTitle } from "@/lib/editorial/normalize";
import {
  ARTICLE_KINDS,
  ARTICLE_REGIONS,
  ARTICLE_TOPICS,
} from "@/lib/editorial/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitArticleButton } from "./submit-button";

const ARTICLE_STATUSES = ["draft", "published"] as const;
const COVER_BUCKET = "article-covers";
const COVER_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const COVER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
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

type CoverImageValidation =
  | {
      extension: string;
      contentType: string;
    }
  | {
      error: string;
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

function readCoverImageFile(formData: FormData) {
  const value = formData.get("cover_image_file");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getFileExtension(fileName: string) {
  return fileName.toLowerCase().split(".").pop() ?? "";
}

function getContentType(file: File, extension: string) {
  if (file.type) {
    return file.type;
  }

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  return `image/${extension}`;
}

function validateCoverImage(file: File): CoverImageValidation {
  const extension = getFileExtension(file.name);
  const contentType = getContentType(file, extension);

  if (
    !COVER_IMAGE_EXTENSIONS.has(extension) ||
    !COVER_IMAGE_TYPES.has(contentType)
  ) {
    return {
      error: "Cover image must be a JPG, JPEG, PNG, or WEBP file.",
    };
  }

  return { extension, contentType };
}

function buildCoverImagePath(userId: string, slug: string, extension: string) {
  const safeSlug =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article";
  const fileExtension = extension === "jpeg" ? "jpg" : extension;

  return `${userId}/${Date.now()}-${safeSlug}.${fileExtension}`;
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

async function uploadCoverImage(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  file: File,
  userId: string,
  slug: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const validation = validateCoverImage(file);

  if ("error" in validation) {
    return validation;
  }

  const filePath = buildCoverImagePath(userId, slug, validation.extension);
  const { error: uploadError } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(filePath, file, {
      contentType: validation.contentType,
      upsert: false,
    });

  if (uploadError) {
    return { error: `Cover image upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(COVER_BUCKET).getPublicUrl(filePath);

  if (!publicUrl) {
    return { error: "Cover image uploaded, but no public URL was generated." };
  }

  return { publicUrl };
}

async function createArticle(formData: FormData) {
  "use server";

  const {
    supabase,
    user,
    profile: editorProfile,
  } = await requireAdmin();

  const title = textField(formData, "title");
  const slugInput = textField(formData, "slug");
  const slug = slugInput || slugifyTitle(title);
  const body = textField(formData, "body");
  const excerpt =
    optionalTextField(formData, "excerpt") || optionalTextField(formData, "summary");
  const status = readStatus(formData);
  const topic = textField(formData, "topic") || "culture";
  const region = textField(formData, "region") || "national";
  const articleKind = textField(formData, "article_kind") || "kinpress_original";

  if (!title || !body || !status) {
    messageRedirect("Title, body, and status are required.");
  }

  if (status === "published" && !excerpt) {
    messageRedirect("Excerpt is required before publishing.");
  }

  if (articleKind === "curated_external") {
    const sourceName = optionalTextField(formData, "source_name");
    const sourceUrl = optionalTextField(formData, "source_url");
    if (!sourceName || !sourceUrl) {
      messageRedirect("Curated stories require source name and canonical URL.");
    }
  }

  const categoryId = optionalTextField(formData, "category_id");
  let categoryName: string | null = null;

  if (categoryId) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .maybeSingle<{ name: string | null }>();

    categoryName = category?.name?.trim() || null;
  }

  const publishedAt = status === "published" ? new Date().toISOString() : null;
  const coverImageFile = readCoverImageFile(formData);
  let coverImageUrl =
    optionalTextField(formData, "image_url") || optionalTextField(formData, "cover_image_url");

  if (coverImageFile) {
    const uploadResult = await uploadCoverImage(
      supabase,
      coverImageFile,
      user.id,
      slug,
    );

    if ("error" in uploadResult) {
      messageRedirect(uploadResult.error);
    } else {
      coverImageUrl = uploadResult.publicUrl;
    }
  }

  const { error } = await supabase.from("articles").insert({
    title,
    slug,
    subtitle: optionalTextField(formData, "subtitle"),
    summary: excerpt,
    excerpt,
    body,
    category_id: categoryId,
    category_name: categoryName,
    tags: readTags(formData),
    cover_image_url: coverImageUrl,
    image_url: coverImageUrl,
    source_name: optionalTextField(formData, "source_name"),
    source_url: optionalTextField(formData, "source_url"),
    is_premium: formData.get("is_premium") === "on",
    is_featured: formData.get("is_featured") === "on",
    editor_pick: formData.get("editor_pick") === "on",
    status,
    published_at: publishedAt,
    author_id: user.id,
    author_name: profileAuthorName(editorProfile, user.email) || "KinPress Editorial",
    reading_time: estimateReadingTime(body),
    region,
    topic,
    article_kind: articleKind,
  });

  if (error) {
    messageRedirect(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/articles/new");
  redirect(`/admin/articles/new?saved=1&slug=${encodeURIComponent(slug)}`);
}

export default async function NewArticlePage({
  searchParams,
}: AdminArticlePageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

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
                placeholder="Auto-generated from title if left blank"
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
              Excerpt
              <textarea
                className="min-h-28 border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="excerpt"
                placeholder="KinPress summary for cards and previews (required to publish)"
                required
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

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Topic
              <select
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                defaultValue="culture"
                name="topic"
              >
                {ARTICLE_TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Region
              <select
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                defaultValue="national"
                name="region"
              >
                {ARTICLE_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
              Article type
              <select
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                defaultValue="kinpress_original"
                name="article_kind"
              >
                {ARTICLE_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-2">
              Source name
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="source_name"
                placeholder="For curated stories only"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-2">
              Source URL
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="source_url"
                placeholder="https://canonical-source.example/story"
                type="url"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-3">
              Cover image upload
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="border border-dashed border-ink/25 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:uppercase file:tracking-[0.12em] file:text-bone"
                name="cover_image_file"
                type="file"
              />
              <span className="text-xs font-normal normal-case tracking-normal text-ink/60">
                JPG, JPEG, PNG, and WEBP files upload to Supabase Storage.
              </span>
            </label>

            <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown lg:col-span-3">
              Image URL
              <input
                className="border border-ink/20 bg-white/70 px-4 py-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-heritage"
                name="image_url"
                placeholder="https://..."
                type="url"
              />
              <span className="text-xs font-normal normal-case tracking-normal text-ink/60">
                Used only when no file is selected.
              </span>
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
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-brown">
                <input className="size-4 accent-heritage" name="editor_pick" type="checkbox" />
                Editor pick
              </label>
            </div>

            <SubmitArticleButton />
          </section>
        </form>
      </section>
    </main>
  );
}
