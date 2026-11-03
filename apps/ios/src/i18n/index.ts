import type { Localized } from '@forsa/data';

import { useApp } from '@/store/app';

import { strings, type StringKey } from './strings';

export type Lang = 'ar' | 'en';
export type { StringKey };

export function translate(lang: Lang, key: StringKey): string {
  return strings[lang][key] ?? strings.ar[key];
}

/** `t('key')` for UI strings, `loc({ar, en})` for localized data fields. */
export function useT() {
  const lang = useApp((s) => s.lang);
  const t = (key: StringKey) => translate(lang, key);
  const loc = (v: Localized) => v[lang];
  return { t, loc, lang };
}
