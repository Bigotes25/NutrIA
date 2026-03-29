export { default } from "next-auth/middleware"

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
