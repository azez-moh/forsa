import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { brandSource } from '@forsa/tokens';
import './globals.css';
import { TokenStyles } from '@/components/layout/TokenStyles';
import { AppShell } from '@/components/layout/AppShell';

/*
 * Tajawal (brand font, verified from forsh.sa) + Inter for Latin.
 * Self-hosted via next/font/local from the OFL files in src/fonts (the same files Google Fonts serves),
 * because the build sandbox cannot reach fonts.googleapis.com. Swap to next/font/google in CI if preferred.
 */
const tajawal = localFont({
  variable: '--font-tajawal',
  display: 'swap',
  src: [
    { path: '../fonts/tajawal-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/tajawal-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/tajawal-arabic-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/tajawal-arabic-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  fallback: ['SF Arabic', 'Geeza Pro', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
});

const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  src: [
    { path: '../fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  fallback: ['-apple-system', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'فرصة وتمكين — فرصتك على بعد خطوة',
    template: '%s · فرصة وتمكين',
  },
  description: 'منصة سعودية لعرض المشاريع للبيع والفرص الاستثمارية والبحث عن شريك أو مستثمر. نموذج تصوّري لإعادة التصميم.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/** Restores the saved locale/theme before paint to avoid a flash (localStorage wrapped in try/catch). */
const bootScript = `(function(){try{var d=document.documentElement;var l=JSON.parse(localStorage.getItem('forsa.locale')||'"ar"');if(l==='en'){d.lang='en';d.dir='ltr';}var t=JSON.parse(localStorage.getItem('forsa.theme')||'"system"');if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable}`} suppressHydrationWarning data-brand={brandSource.primary}>
      <head>
        <TokenStyles />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
