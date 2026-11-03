import { brandSource, cssVariables, opportunityTypes, type ColorScheme } from '@forsa/tokens';

/** Emits every @forsa/tokens value as a --fz-* custom property, for light, dark and forced themes. */
function block(scheme: ColorScheme): string {
  const vars = cssVariables(scheme);
  const lines = Object.entries(vars).map(([k, v]) => `--fz-${k.slice(2)}:${v};`);
  lines.push(`--fz-navy:${brandSource.navy};`);
  lines.push(`--fz-navy-deep:${scheme === 'dark' ? '#0B1230' : '#0E1738'};`);
  lines.push(`--fz-warm:${brandSource.warm};`);
  // Text-safe semantic text on their own 14–16% tints (QA N-P2-1): light ≥ 4.9:1, dark ≥ 7:1.
  lines.push(`--fz-success-text:${scheme === 'dark' ? '#4ADE80' : '#146C2E'};`);
  lines.push(`--fz-warning-text:${scheme === 'dark' ? '#FFB340' : '#9A5200'};`);
  lines.push(`--fz-type-sale:${scheme === 'dark' ? brandSource.primaryDark : opportunityTypes.sale.color};`);
  lines.push(`--fz-type-investment:${scheme === 'dark' ? brandSource.accentDark : opportunityTypes.investment.color};`);
  lines.push(`--fz-type-partner:${opportunityTypes.partner.color};`);
  lines.push(`--fz-type-investor:${opportunityTypes.investor.color};`);
  return lines.join('');
}

export function TokenStyles() {
  const light = block('light');
  const dark = block('dark');
  const css = [
    `:root{${light}color-scheme:light;}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}color-scheme:dark;}}`,
    `:root[data-theme="dark"]{${dark}color-scheme:dark;}`,
    `:root[data-theme="light"]{${light}color-scheme:light;}`,
  ].join('\n');
  return <style id="forsa-tokens" dangerouslySetInnerHTML={{ __html: css }} />;
}
