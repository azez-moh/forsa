/** Web: direction comes from the language (dir on <html>), so no reload is needed. */
export async function applyDirection(_rtl: boolean): Promise<boolean> {
  return true;
}
