import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "打刻記録システム",
  description: "NFC/QRコードによる出退勤記録システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* FOUC防止: CSSロード前の最低限スタイル */
              html { background: #020617; }
              body { background: #020617; color: #f8fafc; opacity: 0; }
              body.ready { opacity: 1; transition: opacity 0.15s ease-in; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // CSS読み込み完了後にbodyを表示
              (function() {
                function show() { document.body.classList.add('ready'); }
                if (document.readyState === 'complete') { show(); }
                else { window.addEventListener('load', show); }
                // フォールバック: 最大1.5秒後には必ず表示
                setTimeout(show, 1500);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
