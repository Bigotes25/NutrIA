import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware(req) {
  // Opciones personalizadas si se requieren
});

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
