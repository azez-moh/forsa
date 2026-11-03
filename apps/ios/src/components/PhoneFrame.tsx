import type { ReactNode } from 'react';

/** Native: no frame. See PhoneFrame.web.tsx for the browser preview. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
