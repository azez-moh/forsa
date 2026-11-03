import type { Metadata, Viewport } from 'next';
import { brandSource } from '@forsa/tokens';
import './globals.css';
import { TokenStyles } from '@/components/layout/TokenStyles';
import { AppShell } from '@/components/layout/AppShell';

/*
 * Tajawal (brand font, verified from forsh.sa) + Inter for Latin, self-hosted from public/fonts (OFL files,
 * the same ones Google Fonts serves; the build sandbox cannot reach fonts.googleapis.com).
 * Declared by hand so each family keeps all its weights while only the two above-the-fold weights
 * (Tajawal 800 for the hero H1, Tajawal 500 for the nav) are preloaded (QA P2-9).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const face = (family: string, file: string, weight: number) =>
  `@font-face{font-family:'${family}';src:url('${BASE}/fonts/${file}.woff2') format('woff2');font-weight:${weight};font-style:normal;font-display:swap;}`;
const FONT_CSS = [
  face('Tajawal', 'tajawal-arabic-400-normal', 400),
  face('Tajawal', 'tajawal-arabic-500-normal', 500),
  face('Tajawal', 'tajawal-arabic-700-normal', 700),
  face('Tajawal', 'tajawal-arabic-800-normal', 800),
  face('Inter', 'inter-latin-400-normal', 400),
  face('Inter', 'inter-latin-500-normal', 500),
  face('Inter', 'inter-latin-600-normal', 600),
  face('Inter', 'inter-latin-700-normal', 700),
  // Full fallback stacks (QA N-P1-1): the Tajawal files are the Arabic subset, so Latin falls through to Inter/system sans.
  `:root{--font-tajawal:'Tajawal','Inter',system-ui,-apple-system,'Segoe UI','SF Arabic','Geeza Pro','Noto Sans Arabic',sans-serif;--font-inter:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;}`,
].join('');
const PRELOAD = ['tajawal-arabic-800-normal', 'tajawal-arabic-500-normal'];

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
    <html lang="ar" dir="rtl" suppressHydrationWarning data-brand={brandSource.primary}>
      <head>
        {PRELOAD.map((f) => (
          <link key={f} rel="preload" href={`${BASE}/fonts/${f}.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <style id="forsa-fonts" dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
        <TokenStyles />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
