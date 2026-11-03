import { Platform, Share } from 'react-native';

import { translate } from '@/i18n';
import { useApp } from '@/store/app';

import { toast } from '@/components/ui';

/**
 * Native: iOS share sheet. Web: navigator.share where available (mobile Safari), otherwise copy
 * the link to the clipboard and confirm with a toast.
 */
export async function shareLink({ title, message, url }: { title?: string; message: string; url: string }) {
  if (Platform.OS !== 'web') {
    try {
      await Share.share({ message, url, title });
    } catch {
      // cancelled
    }
    return;
  }
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  try {
    if (nav?.share) {
      await nav.share({ title, text: message, url });
      return;
    }
  } catch {
    return; // user cancelled the web share sheet
  }
  try {
    await nav?.clipboard?.writeText(`${message}\n${url}`.trim());
    toast(translate(useApp.getState().lang, 'linkCopied'));
  } catch {
    // no clipboard access
  }
}
