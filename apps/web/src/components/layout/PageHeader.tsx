import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Large-title page header that sits right under the glass nav (content starts near the top). */
export function PageHeader({ title, lead, children, className, eyebrow }: { title: string; lead?: string; children?: ReactNode; className?: string; eyebrow?: ReactNode }) {
  return (
    <header className={cn('container-page pb-8 pt-24 md:pb-10 md:pt-32', className)}>
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <h1 className="t-display-m text-label">{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-label-2 md:text-[19px]">{lead}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

export function SectionHeader({ title, lead, action, className, onDark, id }: { title: string; lead?: string; action?: ReactNode; className?: string; onDark?: boolean; id?: string }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        <h2 id={id} className={cn('t-display-m', onDark ? 'text-white' : 'text-label')}>{title}</h2>
        {lead && <p className={cn('mt-3 text-[17px] leading-relaxed md:text-[19px]', onDark ? 'text-white/70' : 'text-label-2')}>{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items, label }: { items: Array<{ href?: string; label: string }>; label: string }) {
  return (
    <nav aria-label={label} className="text-[13px] text-label-2">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-label-3">›</span>}
            {it.href ? (
              <Link href={it.href} className="inline-flex min-h-11 items-center hover:text-label">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-label">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
