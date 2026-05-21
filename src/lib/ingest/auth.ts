import { NextResponse } from "next/server";

export function verifyCronRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (bearer !== secret && headerSecret !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
