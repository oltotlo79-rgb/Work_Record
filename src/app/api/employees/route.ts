import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { employee_number, name, nfc_uid } = await request.json();

  if (!employee_number || !name || !nfc_uid) {
    return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({ employee_number, name, nfc_uid })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '従業員番号またはNFC UIDが既に登録されています' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const { id, employee_number, name, nfc_uid } = await request.json();

  if (!id || !employee_number || !name || !nfc_uid) {
    return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('employees')
    .update({ employee_number, name, nfc_uid })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '従業員番号またはNFC UIDが既に使用されています' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  let queryBuilder = supabase.from('employees').select('*');

  if (query) {
    queryBuilder = queryBuilder.or(`employee_number.ilike.%${query}%,name.ilike.%${query}%`);
  }

  const { data, error } = await queryBuilder.order('employee_number');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
