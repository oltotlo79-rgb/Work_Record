import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(__dirname, '../docs/requirements.md');
const outPath = path.join(__dirname, '../docs/requirements.pdf');

const markdown = fs.readFileSync(mdPath, 'utf-8');
const body = marked(markdown);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
    font-size: 10pt;
    line-height: 1.8;
    color: #1e293b;
    background: #fff;
  }

  /* 表紙風ヘッダー */
  .cover {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
    color: #fff;
    padding: 36px 64px 40px;
    margin-bottom: 40px;
    border-radius: 0 0 24px 24px;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: rgba(59,130,246,0.15);
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(16,185,129,0.1);
  }
  .cover-badge {
    display: inline-block;
    background: rgba(59,130,246,0.3);
    border: 1px solid rgba(59,130,246,0.5);
    color: #93c5fd;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 16px;
  }
  .cover h1 {
    font-size: 26pt;
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 12px;
    position: relative;
  }
  .cover-sub {
    color: #94a3b8;
    font-size: 11pt;
    font-weight: 500;
    position: relative;
  }
  .cover-meta {
    margin-top: 24px;
    display: flex;
    gap: 24px;
    position: relative;
  }
  .cover-meta-item {
    font-size: 8pt;
    color: #64748b;
  }
  .cover-meta-item span {
    display: block;
    color: #cbd5e1;
    font-weight: 700;
    font-size: 9pt;
  }

  .content {
    padding: 0 64px 80px;
  }

  /* 見出し */
  h1 { display: none; }

  h2 {
    font-size: 15pt;
    font-weight: 900;
    color: #0f172a;
    margin: 36px 0 16px;
    padding: 14px 20px;
    background: linear-gradient(135deg, #eff6ff, #f0fdf4);
    border-left: 5px solid #3b82f6;
    border-radius: 0 12px 12px 0;
    page-break-after: avoid;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #1e40af;
    margin: 24px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #dbeafe;
    page-break-after: avoid;
  }

  h4 {
    font-size: 10pt;
    font-weight: 700;
    color: #374151;
    margin: 16px 0 8px;
  }

  p {
    margin-bottom: 10px;
    color: #334155;
  }

  /* リスト */
  ul, ol {
    margin: 8px 0 14px 20px;
    color: #334155;
  }
  li {
    margin-bottom: 5px;
    line-height: 1.7;
  }
  li::marker {
    color: #3b82f6;
  }
  ul ul {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  /* テーブル */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 20px;
    font-size: 9pt;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  thead tr {
    background: linear-gradient(135deg, #1e3a5f, #1e40af);
    color: #fff;
  }
  thead th {
    padding: 10px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 8.5pt;
    letter-spacing: 0.03em;
  }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:nth-child(odd)  { background: #fff; }
  tbody tr:hover           { background: #eff6ff; }
  tbody td {
    padding: 9px 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }

  /* コード */
  code {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 1px 6px;
    border-radius: 4px;
    color: #0f4c8a;
  }
  pre {
    background: #0f172a;
    border-radius: 12px;
    padding: 16px 20px;
    margin: 12px 0 18px;
    overflow: hidden;
  }
  pre code {
    background: none;
    border: none;
    color: #e2e8f0;
    font-size: 8.5pt;
    line-height: 1.7;
    padding: 0;
  }

  /* 区切り線 */
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 28px 0;
  }

  /* strong */
  strong {
    font-weight: 700;
    color: #0f172a;
  }

  /* ページ設定 */
  @page {
    size: A4;
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Requirements Document</div>
  <h1>打刻記録システム</h1>
  <p class="cover-sub">NFC / QRコード 出退勤管理Webアプリケーション</p>
  <div class="cover-meta">
    <div class="cover-meta-item">
      <span>バージョン</span>1.0
    </div>
    <div class="cover-meta-item">
      <span>作成日</span>2026-03-18
    </div>
    <div class="cover-meta-item">
      <span>技術スタック</span>Next.js 15 + Supabase + Vercel
    </div>
  </div>
</div>

<div class="content">
${body}
</div>

</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setContent(html, { waitUntil: 'networkidle0' });

await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', bottom: '18mm', left: '0', right: '0' },
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:0;"></div>',
  footerTemplate: `<div style="width:100%;padding:0 64px 6mm;font-size:8pt;color:#94a3b8;display:flex;justify-content:space-between;font-family:sans-serif;box-sizing:border-box;">
    <span>打刻記録システム 要件定義書</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`,
});

await browser.close();

console.log(`✓ PDF generated: ${outPath}`);
