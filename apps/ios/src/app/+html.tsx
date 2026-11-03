import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only HTML shell for the browser preview (static export). Arabic/RTL by default; the app
 * updates dir/lang on <html> when the language changes. Navy backdrop around a phone-width column.
 */
export default function Root({ children }: PropsWithChildren) {
  // SDK 58: the bundle <script> tags and head tags arrive as nodes here and must be rendered.
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();
  return (
    <html lang="ar" dir="rtl" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="theme-color" content="#17234F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="فرصة وتمكين" />
        <title>فرصة وتمكين · نموذج التطبيق</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

const css = `
html, body { background: #17234F; }
body { font-family: -apple-system, "SF Arabic", "SF Pro Text", "Geeza Pro", "Noto Sans Arabic", system-ui, sans-serif; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }
@media (min-width: 500px) {
  #phone-frame { margin: 24px 0; max-height: 932px; border-radius: 44px; box-shadow: 0 30px 80px rgba(0,0,0,0.45), 0 0 0 10px #0b1230; }
}
`;
