import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware() {
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
