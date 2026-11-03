Logo assets (not downloaded — sandbox proxy returned 403 for forsh.sa; WebFetch could not retrieve the PNGs):
- Light/default: https://forsh.sa/_next/static/media/logo.b519c833.png
- Dark:          https://forsh.sa/_next/static/media/logo-dark.59305712.png
- Next/Image proxy variants: https://forsh.sa/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.b519c833.png&w=256&q=75
Action: download manually in a browser, eyedrop the brand colors, and update packages/tokens/src/index.ts `brandSource`.
