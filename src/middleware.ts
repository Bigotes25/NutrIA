import { withAuth } from "next-auth/middleware";
import { authSecret } from "@/lib/auth-secret";

export default withAuth(
  function middleware() {
    // La autorización real se resuelve en withAuth; no necesitamos lógica adicional aquí.
  },
  {
    secret: authSecret,
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthorized = !!token;

        console.log("Middleware auth check", {
          path: req.nextUrl.pathname,
          isAuthorized,
          tokenId: (token?.id as string | undefined) ?? null,
          tokenSub: token?.sub ?? null,
        });

        return isAuthorized;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add/:path*",
    "/history/:path*",
    "/meal/:path*",
    "/onboarding/:path*",
    "/profile/:path*"
  ]
}
