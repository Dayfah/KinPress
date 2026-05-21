import type { SupabaseClient, User } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  display_name: string | null;
  role: string | null;
};

function defaultDisplayName(user: User) {
  const fromMeta =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim()
      : "";

  if (fromMeta) {
    return fromMeta;
  }

  const emailPrefix = user.email?.split("@")[0]?.trim();
  return emailPrefix && emailPrefix.length > 0 ? emailPrefix : "KinPress reader";
}

/** Ensures profiles + authors rows exist after sign-up or OAuth. */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<ProfileRow | null> {
  const displayName = defaultDisplayName(user);

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!existing) {
    const { data: created, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: displayName,
        role: "reader",
      }, {
        ignoreDuplicates: true,
        onConflict: "id",
      })
      .select("id, display_name, role")
      .maybeSingle<ProfileRow>();

    if (error && error.code !== "23505") {
      console.error("[KinPress] ensureUserProfile upsert failed", error.message);
    }

    if (created) {
      await ensureAuthorRow(supabase, user.id, displayName);
      return created;
    }

    const { data: refetched } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    if (refetched) {
      await ensureAuthorRow(supabase, user.id, refetched.display_name?.trim() || displayName);
      return refetched;
    }
  }

  await ensureAuthorRow(
    supabase,
    user.id,
    existing?.display_name?.trim() || displayName,
  );

  return existing ?? null;
}

async function ensureAuthorRow(
  supabase: SupabaseClient,
  userId: string,
  name: string,
) {
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (author) {
    return;
  }

  const { error } = await supabase.from("authors").insert({
    id: userId,
    name,
  });

  if (error && error.code !== "23505") {
    console.error("[KinPress] ensureAuthorRow failed", error.message);
  }
}
