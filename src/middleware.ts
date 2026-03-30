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
      authorized: ({ token }) => !!token,
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
