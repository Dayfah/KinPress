import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth/profile";
import { getProfileForUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ profile: null }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }

  let profile = await getProfileForUser(user.id);

  if (!profile) {
    await ensureUserProfile(supabase, user);
    profile = await getProfileForUser(user.id);
  }

  return NextResponse.json({ profile });
}
