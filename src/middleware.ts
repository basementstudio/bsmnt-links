import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/'
}

export function middleware(req: NextRequest) {
  const siteUsername = process.env.SITE_USERNAME
  const sitePassword = process.env.SITE_PASSWORD

  if (!siteUsername || !sitePassword) {
    // do nothing
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === siteUsername && pwd === sitePassword) {
      return NextResponse.next()
    }
  }

  return NextResponse.next({
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"'
    }
  })
}
