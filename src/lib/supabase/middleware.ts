import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Refreshes the auth session on every dashboard request and bounces signed-out
 * visitors to the login screen. Without Supabase configured the dashboard is
 * unusable anyway, so it redirects straight to login, which explains why.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isLogin = request.nextUrl.pathname === "/dashboard/login";

  if (!isSupabaseConfigured) {
    return isLogin ? response : NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates against the auth server; getSession() would trust the
  // cookie, which is not good enough to gate an editor on.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = new URL("/dashboard/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
