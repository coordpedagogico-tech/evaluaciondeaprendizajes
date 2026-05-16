import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analizar/:path*',
    '/crear/:path*',
    '/pauta/:path*',
    '/tabla/:path*',
    '/admin/:path*'
  ]
}
