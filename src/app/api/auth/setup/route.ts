import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase_config" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const profile = await ensureUserProfile(supabase, user);

  if (!profile) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "profile_setup_failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
