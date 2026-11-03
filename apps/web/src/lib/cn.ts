export function cn(...parts: Array<string | number | bigint | boolean | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
