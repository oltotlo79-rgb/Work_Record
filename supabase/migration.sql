-- 打刻記録システム DBスキーマ
-- Supabase SQL Editorで実行してください

-- 従業員テーブル
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text UNIQUE NOT NULL,
  name text NOT NULL,
  nfc_uid text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 打刻記録テーブル
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, date)
);

-- 閲覧メンバーテーブル
CREATE TABLE IF NOT EXISTS viewing_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id text NOT NULL,
  target_employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (viewer_id, target_employee_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_viewing_members_viewer ON viewing_members(viewer_id);
CREATE INDEX IF NOT EXISTS idx_employees_nfc_uid ON employees(nfc_uid);

-- RLS無効化（簡易運用）
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_members ENABLE ROW LEVEL SECURITY;

-- 全アクセス許可ポリシー
CREATE POLICY "Allow all access on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on viewing_members" ON viewing_members FOR ALL USING (true) WITH CHECK (true);
