import * as LocalAuthentication from 'expo-local-authentication';

export type GateResult = 'ok' | 'failed' | 'unavailable';

/**
 * Face ID / Touch ID gate with passcode fallback (US-IOS-04).
 * Simulator or a device without biometrics/passcode returns 'unavailable' so the demo can continue.
 */
export async function biometricGate(reason: string, cancelLabel: string): Promise<GateResult> {
  try {
    const [hasHw, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
    if (!hasHw || !enrolled) {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      if (level === LocalAuthentication.SecurityLevel.NONE) return 'unavailable';
    }
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel,
      disableDeviceFallback: false,
    });
    return res.success ? 'ok' : 'failed';
  } catch {
    return 'unavailable';
  }
}
