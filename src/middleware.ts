import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const employeeNumber = request.cookies.get('employee_number')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (employeeNumber) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!employeeNumber) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/attendance', '/register', '/records', '/members', '/login'],
};
