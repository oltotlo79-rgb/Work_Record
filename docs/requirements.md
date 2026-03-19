# 打刻記録システム 要件定義書

## 1. システム概要

スマートフォンのNFC（Type A/B）で社員証を読み取り、出退勤時刻を記録するWebアプリケーション。
iOSユーザー向けにQRコード読み取りにも対応する。

---

## 2. 目的・背景

- 社員証（NFCカード）をスマートフォンにかざすだけで出退勤を記録できる簡易打刻システムを構築する
- iPhoneはWeb NFC API非対応のため、QRコードによる代替手段を提供する
- 管理者・チームリーダーが部下やメンバーの打刻状況をリアルタイムに確認できるようにする

---

## 3. 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 15 (App Router) | フレームワーク |
| TypeScript | 型安全な開発 |
| Supabase (PostgreSQL) | データベース・バックエンド |
| Web NFC API | Android ChromeでのNFCカード読み取り |
| html5-qrcode | QRコードスキャン（iOS対応） |
| qrcode | QRコード画像生成 |
| Tailwind CSS | UIスタイリング |
| Vercel | ホスティング・デプロイ |

---

## 4. ユーザー種別

| ユーザー | 説明 |
|----------|------|
| 一般従業員 | 従業員番号でログイン。打刻記録、メンバー登録、打刻確認を利用 |
| admin | 「admin」でログイン。メンバー登録専用（登録後は従業員番号での再ログインを促す） |

※パスワード認証なし（従業員番号のみで簡易ログイン）

---

## 5. 機能要件

### 5.1 ログイン機能（`/login`）

- 従業員番号を入力してログインする
- 「admin」と入力した場合も管理者としてログイン可能
- ログイン状態はCookie（SameSite=Lax、httpOnly=false）で30日間保持する
- 未ログイン時は全ページから`/login`にリダイレクトする

### 5.2 ホーム画面（`/`）

- システムタイトル「打刻記録システム」を表示する
- 以下の4つの機能ボタンを表示する
  - 打刻記録（`/attendance`に遷移）
  - メンバー登録（`/register`に遷移）
  - メンバー一覧（`/members`に遷移）
  - 打刻確認（`/records`に遷移）
- NFC非対応デバイスでは「QRコードモードで動作します」の案内を表示する
- ログアウトボタンを表示する

### 5.3 打刻記録機能（`/attendance`）

- 始業/終業をトグルスイッチで切り替える
- **初期選択の自動判定:**
  - 画面表示時にログイン中の従業員の当日打刻記録を確認する
  - 始業打刻済みの場合 → 終業を初期選択
  - 始業未打刻の場合 → 始業を初期選択
  - adminログインの場合 → 始業を初期選択
- **Android（NFC対応デバイス）の場合:**
  - Web NFC APIでNFCカードを読み取る
  - カードのUIDを取得して従業員を照合する
- **iPhone/NFC非対応デバイスの場合:**
  - 「QRコードをスキャン」ボタンを表示する
  - ボタン押下でカメラを起動し、QRコードを読み取ってUIDを取得・従業員を照合する
  - 「スキャンを停止」ボタンでカメラを停止できる
- 従業員照合後、attendance_recordsテーブルにUPSERTする
  - 同日は1レコード（始業・終業で同一レコードを更新）
- 成功/失敗のフィードバックを画面に表示する

### 5.4 メンバー登録機能（`/register`）

- 以下のフォーム項目を入力する
  - 従業員番号（必須、ユニーク）
  - 氏名（必須）
  - NFC カードUID（必須、ユニーク）
- NFC対応デバイス：「社員証を読み取る」ボタンでNFCカードのUIDを自動取得する
- NFC非対応デバイス：UIDの手動入力フィールドを表示する
- 登録完了後、以下を表示する
  - 登録情報の確認
  - QRコード（NFC UIDをエンコードしたもの）
  - QRコードダウンロードボタン（PNG形式）
- 連続登録が可能（「続けて登録」ボタン）
- **adminログイン時の挙動:**
  - 登録完了後「登録した従業員番号でログインし直してください。」のポップアップを表示する
  - OKを押すとログアウトし、ログイン画面に遷移する

### 5.5 メンバー一覧機能（`/members`）

- 登録済み全従業員の一覧を表示する
- 各メンバーについて以下の操作が可能
  - **編集**: 従業員番号、氏名、NFC UIDを変更できる
  - **削除**: 確認ステップ付きで従業員データを削除できる（CASCADE削除）

### 5.6 打刻確認機能（`/records`）

- **adminログイン時の挙動:**
  - 「自身の従業員番号でログインしメンバーを追加することで打刻情報が見れるようになります。」の案内メッセージを表示する
  - 閲覧メンバーの追加ボタンや打刻データの表示は行わない
- **一般従業員ログイン時の挙動:**
  - 初期状態から自分自身の打刻記録を表示する（名前の横に「(自分)」ラベル付き、削除不可）
  - 「閲覧メンバー追加」ボタンで他の従業員をチェックリストから追加可能
    - 追加済みのメンバーはチェックが入った状態で表示される
    - チェックを入れると閲覧リストに追加、チェックを外すと閲覧リストから除外される
    - 追加・削除はviewing_membersテーブルに永続化される
    - 複数メンバーの同時追加・削除が可能
  - 自分＋追加済みメンバーの打刻一覧をテーブル形式で表示する
    - 表示項目：氏名、従業員番号、始業時刻、終業時刻
- **赤強調ルール（当日のみ適用）:**
  - 現在時刻が8:00以降かつ始業記録なし → 始業セルを赤背景で強調
  - 現在時刻が17:00以降かつ終業記録なし → 終業セルを赤背景で強調
- 「日付選択」ボタンでカレンダーを表示し、過去の日付を選択して記録を閲覧できる
- 「今日に戻る」ボタンで当日の記録に戻る
- メンバーの削除（閲覧リストからの除外）が可能（自分自身は除外不可）

---

## 6. データベース設計

### 6.1 employeesテーブル（従業員）

| カラム | 型 | 制約 | 備考 |
|--------|------|------|------|
| id | uuid | PK, auto | 主キー |
| employee_number | text | UNIQUE, NOT NULL | 従業員番号 |
| name | text | NOT NULL | 氏名 |
| nfc_uid | text | UNIQUE, NOT NULL | NFCカードUID |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

### 6.2 attendance_recordsテーブル（打刻記録）

| カラム | 型 | 制約 | 備考 |
|--------|------|------|------|
| id | uuid | PK, auto | 主キー |
| employee_id | uuid | FK→employees, NOT NULL | 従業員ID |
| date | date | NOT NULL | 記録日 |
| clock_in | timestamptz | nullable | 始業時刻 |
| clock_out | timestamptz | nullable | 終業時刻 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

- UNIQUE制約: (employee_id, date) — 同日は1レコードでUPSERT

### 6.3 viewing_membersテーブル（閲覧メンバー管理）

| カラム | 型 | 制約 | 備考 |
|--------|------|------|------|
| id | uuid | PK, auto | 主キー |
| viewer_id | text | NOT NULL | 閲覧者の従業員番号 |
| target_employee_id | uuid | FK→employees, NOT NULL | 閲覧対象 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

- UNIQUE制約: (viewer_id, target_employee_id)
- viewer_idはadminの場合もあるためtext型で管理

---

## 7. iOS対応（QRコード方式）

### 7.1 仕組み

- メンバー登録時、NFCカードUIDをQRコード化して表示・ダウンロード可能にする
- 打刻記録画面でNFC非対応デバイス（iPhone等）の場合、「QRコードをスキャン」ボタンを表示しボタン押下でカメラを起動する
- QRコードの中身はnfc_uidの値（NFCカードUIDと同じIDで照合）

### 7.2 フロー

1. メンバー登録 → NFC読み取り後、登録完了画面でQRコード表示＋ダウンロード
2. 打刻記録（iPhone）→ カメラでQRコード読み取り → UID照合 → 打刻
3. 打刻記録（Android）→ NFCで読み取り → UID照合 → 打刻

---

## 8. 画面遷移図

```
/login → ログイン成功 → /（ホーム）
                          ├── /attendance（打刻記録）
                          ├── /register（メンバー登録）
                          ├── /members（メンバー一覧・編集・削除）
                          └── /records（打刻確認）
```

---

## 9. API設計

| メソッド | エンドポイント | 概要 |
|----------|----------------|------|
| POST | /api/auth/login | ログイン（Cookie設定） |
| DELETE | /api/auth/login | ログアウト（Cookie削除） |
| GET | /api/employees | 従業員一覧・検索（クエリパラメータ q） |
| POST | /api/employees | 従業員登録 |
| PUT | /api/employees | 従業員情報更新 |
| DELETE | /api/employees | 従業員削除（クエリパラメータ id） |
| GET | /api/employees/[nfcUid] | NFCのUIDで従業員検索 |
| GET | /api/attendance | 打刻記録取得（employee_ids, date） |
| POST | /api/attendance | 打刻記録（UPSERT） |
| GET | /api/viewing-members | 閲覧メンバー一覧取得（viewer_id） |
| POST | /api/viewing-members | 閲覧メンバー追加 |
| DELETE | /api/viewing-members | 閲覧メンバー削除（id） |

---

## 10. 非機能要件

### 10.1 対応デバイス・ブラウザ

- Android: Chrome（NFC読み取り対応）
- iOS: Safari / Chrome（QRコード読み取り対応）
- PC: Chrome / Edge（手動入力・閲覧のみ）

### 10.2 UIデザイン

- ダークテーマ + グラスモーフィズムデザイン
- モバイルファーストで設計（スマートフォンでの操作を最優先）
- ホーム画面は2x2グリッドのアイコンカード形式
- カスタムCSSクラス: glass-panel, glass-card, text-gradient, btn-premium

### 10.3 タイムゾーン

- 日本標準時（JST / Asia/Tokyo）で日付・時刻を管理する

### 10.4 セキュリティ

- Cookie: SameSite=Lax（クライアント側でviewerIdを取得するためhttpOnly=false）
- RLSは簡易運用のため全アクセス許可ポリシーを適用
- パスワード認証は未実装（将来的に追加検討）

### 10.5 デプロイ

- Vercelにデプロイ
- 環境変数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## 11. 制約事項・前提条件

- Web NFC APIはAndroid Chromeのみ対応（HTTPS必須）
- iOSでのNFC読み取りはWeb標準では不可のため、QRコード方式で代替
- パスワード認証は本バージョンでは未実装
- RLSは全許可ポリシーとし、本格運用時に見直す
