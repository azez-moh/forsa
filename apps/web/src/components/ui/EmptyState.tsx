import type { ReactNode } from 'react';

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-bg-2 px-6 py-16 text-center">
      {icon && <span className="grid size-14 place-items-center rounded-full bg-bg text-label-2 shadow-e1">{icon}</span>}
      <h3 className="t-headline text-label">{title}</h3>
      {body && <p className="max-w-sm text-[15px] text-label-2">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
