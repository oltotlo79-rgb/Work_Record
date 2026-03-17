import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { employee_id, type } = await request.json();

  if (!employee_id || !type) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 });
  }

  if (type !== 'clock_in' && type !== 'clock_out') {
    return NextResponse.json({ error: '無効な打刻タイプです' }, { status: 400 });
  }

  const now = new Date();
  const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const dateStr = `${jstDate.getFullYear()}-${String(jstDate.getMonth() + 1).padStart(2, '0')}-${String(jstDate.getDate()).padStart(2, '0')}`;

  // Check for existing record
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee_id)
    .eq('date', dateStr)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({ [type]: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } else {
    const record: Record<string, string> = {
      employee_id,
      date: dateStr,
    };
    record[type] = now.toISOString();

    const { data, error } = await supabase
      .from('attendance_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeIds = searchParams.get('employee_ids');
  const date = searchParams.get('date');

  if (!employeeIds) {
    return NextResponse.json({ error: 'employee_ids is required' }, { status: 400 });
  }

  const ids = employeeIds.split(',');

  let targetDate = date;
  if (!targetDate) {
    const now = new Date();
    const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    targetDate = `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, '0')}-${String(jst.getDate()).padStart(2, '0')}`;
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, employees(employee_number, name)')
    .in('employee_id', ids)
    .eq('date', targetDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
