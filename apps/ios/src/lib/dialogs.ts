import { ActionSheetIOS, Alert, Platform } from 'react-native';

/**
 * Cross-platform dialogs. Native iOS uses ActionSheetIOS / Alert / Alert.prompt.
 * Web (browser preview) uses an in-app action sheet (WebActionSheetHost) and the browser's
 * confirm/prompt, since those iOS APIs do nothing on web.
 */
type SheetRequest = { title?: string; options: string[]; cancelIndex: number; destructiveIndex?: number; onPick: (i: number) => void };
let showWebSheet: ((r: SheetRequest) => void) | null = null;
export const registerWebSheet = (fn: ((r: SheetRequest) => void) | null) => {
  showWebSheet = fn;
};

export function actionSheet(r: SheetRequest) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: r.title, options: r.options, cancelButtonIndex: r.cancelIndex, destructiveButtonIndex: r.destructiveIndex },
      r.onPick,
    );
    return;
  }
  if (showWebSheet) showWebSheet(r);
}

type Btn = { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void };

export function alert(title: string, message?: string, buttons?: Btn[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = [title, message].filter(Boolean).join('\n\n');
  const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
  if (actions.length === 0) {
    window.alert(text);
    return;
  }
  if (window.confirm(text)) actions[actions.length - 1].onPress?.();
  else buttons?.find((b) => b.style === 'cancel')?.onPress?.();
}

export function prompt(title: string, message: string, onSubmit: (v: string | undefined) => void, labels: { ok: string; cancel: string }) {
  if (Platform.OS === 'ios') {
    Alert.prompt(
      title,
      message,
      [
        { text: labels.cancel, style: 'cancel' },
        { text: labels.ok, onPress: (v?: string) => onSubmit(v) },
      ],
      'plain-text',
      '',
      'number-pad',
    );
    return;
  }
  const v = window.prompt(`${title}\n\n${message}`, '');
  if (v !== null) onSubmit(v);
}
