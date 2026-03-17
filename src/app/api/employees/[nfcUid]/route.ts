import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nfcUid: string }> }
) {
  const { nfcUid } = await params;

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('nfc_uid', nfcUid)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '未登録のカードです' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
