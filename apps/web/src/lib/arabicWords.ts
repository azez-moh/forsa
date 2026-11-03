/**
 * Price in Arabic words (US-OPP-02, US-LST-03), e.g. 1_500_000 -> "مليون وخمسمئة ألف ريال".
 * Covers 1 .. 999,999,999,999 with the usual Saudi business conventions (dual and 3–10 plural forms).
 */
const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(HUNDREDS[h]);
  if (r) {
    if (r < 10) parts.push(ONES[r]);
    else if (r < 20) parts.push(TEENS[r - 10]);
    else {
      const o = r % 10;
      const tn = Math.floor(r / 10);
      parts.push(o ? `${ONES[o]} و${TENS[tn]}` : TENS[tn]);
    }
  }
  return parts.join(' و');
}

type Scale = { one: string; two: string; plural: string };
const SCALES: Array<[number, Scale]> = [
  [1e9, { one: 'مليار', two: 'ملياران', plural: 'مليارات' }],
  [1e6, { one: 'مليون', two: 'مليونان', plural: 'ملايين' }],
  [1e3, { one: 'ألف', two: 'ألفان', plural: 'آلاف' }],
];

function scaled(count: number, s: Scale): string {
  if (count === 1) return s.one;
  if (count === 2) return s.two;
  if (count >= 3 && count <= 10) return `${below1000(count)} ${s.plural}`;
  return `${below1000(count)} ${s.one}`;
}

export function arabicNumberWords(value: number): string {
  let n = Math.floor(Math.abs(value));
  if (n === 0) return 'صفر';
  const parts: string[] = [];
  for (const [size, scale] of SCALES) {
    const c = Math.floor(n / size);
    if (c) {
      parts.push(scaled(c, scale));
      n -= c * size;
    }
  }
  if (n) parts.push(below1000(n));
  return parts.join(' و');
}

export function arabicPriceWords(value: number): string {
  return `${arabicNumberWords(value)} ريال`;
}
