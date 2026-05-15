import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

type Profile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  subscription_status: string | null;
};

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot set cookies; middleware can refresh them.
          }
        },
      },
    },
  );
}

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatProfileValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "Not set";
}

function formatUsername(username: string | null) {
  return username && username.trim().length > 0
    ? `@${username}`
    : "Username not set";
}

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: formValue(formData, "display_name"),
      username: formValue(formData, "username"),
      bio: formValue(formData, "bio"),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "display_name, username, avatar_url, bio, role, subscription_status",
    )
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  return (
    <main className="kp-section-tight">
      <div className="kp-page-container max-w-4xl">
        <div className="mb-8 space-y-3">
          <p className="kp-eyebrow">Account</p>
          <h1 className="font-serif text-4xl font-semibold tracking-editorial text-foreground sm:text-5xl">
            Your profile
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Keep your public KinPress identity current for comments,
            submissions, and membership access.
          </p>
        </div>

        {params?.saved ? (
          <p className="mb-6 rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
            Profile updated.
          </p>
        ) : null}

        {params?.error ? (
          <p className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            {params.error}
          </p>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <aside className="kp-form h-fit space-y-5">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted font-serif text-2xl text-muted-foreground">
                  {profile?.display_name?.charAt(0) ??
                    profile?.username?.charAt(0) ??
                    user.email?.charAt(0) ??
                    "K"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-serif text-xl font-semibold text-foreground">
                  {formatProfileValue(profile?.display_name ?? null)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {formatUsername(profile?.username ?? null)}
                </p>
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="kp-label">Avatar URL</dt>
                <dd className="mt-1 break-words text-muted-foreground">
                  {formatProfileValue(profile?.avatar_url ?? null)}
                </dd>
              </div>
              <div>
                <dt className="kp-label">Role</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {formatProfileValue(profile?.role ?? null)}
                </dd>
              </div>
              <div>
                <dt className="kp-label">Subscription</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {formatProfileValue(profile?.subscription_status ?? null)}
                </dd>
              </div>
            </dl>
          </aside>

          <form action={updateProfile} className="kp-form kp-form-grid">
            <div className="kp-field">
              <label className="kp-label" htmlFor="display_name">
                Display name
              </label>
              <input
                className="kp-input"
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name ?? ""}
                placeholder="Your public name"
              />
            </div>

            <div className="kp-field">
              <label className="kp-label" htmlFor="username">
                Username
              </label>
              <input
                className="kp-input"
                id="username"
                name="username"
                defaultValue={profile?.username ?? ""}
                placeholder="kinpress_reader"
              />
            </div>

            <div className="kp-field">
              <label className="kp-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                className="kp-textarea"
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                placeholder="A short note about you"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Avatar uploads are not available yet.
              </p>
              <button className="kp-button" type="submit">
                Save profile
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

