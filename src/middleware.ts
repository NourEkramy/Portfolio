import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/** Only the dashboard needs a session; the public site is fully static. */
export const config = {
  matcher: ["/dashboard/:path*"],
};
