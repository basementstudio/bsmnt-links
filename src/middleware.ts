import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/', '/api/shorten']
}

export function middleware(req: NextRequest) {
  const siteUsername = process.env.SITE_USERNAME
  const sitePassword = process.env.SITE_PASSWORD

  if (!siteUsername || !sitePassword) {
    // do nothing
    return NextResponse.next()
  }

  const url = req.nextUrl
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === siteUsername && pwd === sitePassword) {
      return NextResponse.next()
    }
  }

  url.pathname = '/api/auth'

  return NextResponse.rewrite(url)
}
