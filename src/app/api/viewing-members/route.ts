import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewerId = searchParams.get('viewer_id');

  if (!viewerId) {
    return NextResponse.json({ error: 'viewer_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('viewing_members')
    .select('*, employees:target_employee_id(id, employee_number, name)')
    .eq('viewer_id', viewerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { viewer_id, target_employee_id } = await request.json();

  if (!viewer_id || !target_employee_id) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('viewing_members')
    .insert({ viewer_id, target_employee_id })
    .select('*, employees:target_employee_id(id, employee_number, name)')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '既に追加済みです' }, { status: 409 });
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
    .from('viewing_members')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
