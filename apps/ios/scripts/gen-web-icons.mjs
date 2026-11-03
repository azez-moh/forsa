import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Regenerate: node apps/ios/scripts/gen-web-icons.mjs
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dir = path.join(path.dirname(require.resolve('lucide/package.json')), 'dist/esm/icons/');
const map = {
  'storefront': 'store', 'chart.line.uptrend.xyaxis': 'trending-up', 'person.2': 'users', 'person.2.fill': 'users',
  'lightbulb': 'lightbulb', 'sparkle.magnifyingglass': 'search', 'magnifyingglass': 'search',
  'square.grid.2x2': 'layout-grid', 'square.grid.2x2.fill': 'layout-grid', 'plus': 'plus', 'tray': 'inbox', 'tray.fill': 'inbox',
  'person.crop.circle': 'circle-user-round', 'person.crop.circle.fill': 'circle-user-round',
  'person.crop.circle.badge.questionmark': 'circle-question-mark',
  'chevron.right': 'chevron-right', 'chevron.left': 'chevron-left', 'chevron.down': 'chevron-down', 'chevron.up': 'chevron-up',
  'checkmark': 'check', 'checkmark.circle.fill': 'circle-check', 'circle': 'circle', 'checkmark.seal.fill': 'badge-check', 'checkmark.seal': 'badge-check',
  'checkmark.shield': 'shield-check', 'heart': 'heart', 'heart.fill': 'heart', 'lock.fill': 'lock', 'lock.doc': 'file-lock',
  'bell.badge': 'bell-ring', 'bell.badge.fill': 'bell-ring', 'book.closed': 'book', 'briefcase': 'briefcase', 'briefcase.fill': 'briefcase',
  'bubble.left.and.bubble.right': 'message-circle', 'building.2': 'building', 'calendar.badge.checkmark': 'calendar-check',
  'calendar.badge.plus': 'calendar-plus', 'chart.bar.doc.horizontal': 'file-chart-column', 'doc.badge.plus': 'file-plus',
  'doc.richtext': 'file-text', 'doc.text': 'file-text', 'doc.text.magnifyingglass': 'file-search', 'envelope.fill': 'mail',
  'exclamationmark.triangle.fill': 'triangle-alert', 'exclamationmark.circle': 'circle-alert', 'flask': 'flask-conical',
  'globe': 'globe', 'info.circle.fill': 'info', 'line.3.horizontal.decrease.circle': 'sliders-horizontal', 'slider.horizontal.3': 'sliders-horizontal',
  'mappin': 'map-pin', 'message.fill': 'message-square', 'paperplane': 'send', 'paperplane.fill': 'send', 'person.fill': 'user',
  'person.badge.shield.checkmark': 'user-check', 'person.badge.key': 'key-round', 'faceid': 'scan-face', 'photo': 'image',
  'play.fill': 'play', 'play.rectangle.fill': 'circle-play', 'questionmark.circle.fill': 'circle-question-mark',
  'questionmark.folder': 'file-question-mark', 'safari': 'compass', 'sparkles': 'sparkles', 'square.stack': 'layers', 'star.fill': 'star',
  'square.and.arrow.up': 'share', 'xmark': 'x', 'xmark.circle.fill': 'circle-x', 'arrow.right.circle.fill': 'circle-arrow-right',
  'arrow.left.circle.fill': 'circle-arrow-left', 'arrow.up': 'arrow-up', 'arrow.up.arrow.down': 'arrow-up-down', 'clock': 'clock',
  'signature': 'signature',
};
const filled = new Set(['heart.fill', 'star.fill', 'play.fill']);
let out = `/* Generated from lucide (ISC) by scripts/gen-web-icons.mjs. SF Symbol name → SVG nodes for web. */\n`;
out += `export type IconNode = [string, Record<string, string | number>][];\n`;
out += `export const FILLED = new Set<string>(${JSON.stringify([...filled])});\n`;
out += `export const ICONS: Record<string, IconNode> = {\n`;
for (const [sf, lu] of Object.entries(map)) {
  const src = fs.readFileSync(dir + lu + '.mjs', 'utf8');
  const body = src.slice(src.indexOf('= [') + 2, src.lastIndexOf('];') + 1);
  const nodes = eval(body).map(([t, a]) => [t, Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'key'))]);
  out += `  ${JSON.stringify(sf)}: ${JSON.stringify(nodes)},\n`;
}
out += `};\n`;
fs.writeFileSync(path.join(here, '../src/components/webIcons.ts'), out);
console.log(Object.keys(map).length);
