import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { employee_number } = await request.json();

  if (!employee_number || typeof employee_number !== 'string') {
    return NextResponse.json({ error: '従業員番号を入力してください' }, { status: 400 });
  }

  const trimmed = employee_number.trim();
  if (trimmed.length === 0) {
    return NextResponse.json({ error: '従業員番号を入力してください' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('employee_number', trimmed, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('employee_number');
  return response;
}
