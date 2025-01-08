import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAuthRoute = path === '/login' || path === '/register'
  const isProtectedRoute = path.startsWith('/posts/create') || path.includes('/posts/user/')
  
  const userJson = request.cookies.get('user-storage')?.value
  const isAuthenticated = userJson ? JSON.parse(userJson).state.isAuthenticated : false

  // Redirect authenticated users away from login/register
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/posts/create', '/posts/user/:path*']
} 