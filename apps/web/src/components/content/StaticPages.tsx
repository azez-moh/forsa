'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { ChevronDown, Mail, MapPin, MessageCircle, Search } from 'lucide-react';
import { faqs, platformContact, platformStats, type Faq } from '@forsa/data';
import { useApp } from '@/lib/store';
import { formatCompact, formatSAR } from '@/lib/format';
import { normalizeArabic } from '@/lib/opportunity';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatTile } from '@/components/ui/StatTile';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SelectField, TextArea, TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthFlow } from '@/components/flows/AuthSheet';
import type { DictKey } from '@/lib/i18n';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ */
/* S14 About (US-HELP-02)                                               */
/* ------------------------------------------------------------------ */
export function AboutView() {
  const { t, locale } = useApp();
  return (
    <>
      <PageHeader title={t('aboutTitle')} lead={t('aboutLead')} />
      <div className="container-page pb-28">
        <div className="grid grid-cols-2 gap-8 rounded-xl bg-bg-2 p-8 md:grid-cols-4">
          <StatTile value={formatSAR(platformStats.totalValueSar, locale)} label={t('statsValue')} />
          <StatTile value={platformStats.opportunities.toLocaleString('en-US')} label={t('statsOpportunities')} />
          <StatTile value={platformStats.users.toLocaleString('en-US')} label={t('statsUsers')} />
          <StatTile value={formatCompact(platformStats.totalViews, locale)} label={t('statsViews')} />
        </div>
        <p className="mt-3 text-[13px] text-label-2">{t('statsAsOf')}</p>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <section>
            <h2 className="t-title1">{t('aboutMission')}</h2>
            <p className="mt-4 text-[19px] leading-relaxed text-label-2">{t('aboutMissionBody')}</p>
          </section>
          <section>
            <h2 className="t-title1">{t('aboutVision')}</h2>
            <p className="mt-4 text-[19px] leading-relaxed text-label-2">{t('aboutVisionBody')}</p>
          </section>
        </div>

        <section className="mt-20">
          <h2 className="t-title1 mb-8">{t('aboutValues')}</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {(
              [
                ['valueTrust', 'valueTrustBody'],
                ['valueClarity', 'valueClarityBody'],
                ['valueEnablement', 'valueEnablementBody'],
              ] as const
            ).map(([h, b]) => (
              <div key={h} className="border-t border-separator/50 pt-6">
                <h3 className="t-title3">{t(h)}</h3>
                <p className="mt-2 text-[17px] text-label-2">{t(b)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-xl p-10 text-white" style={{ background: 'var(--fz-navy)' }}>
          <h2 className="t-title1">{t('howTitle')}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {(
              [
                ['howBuyerTitle', ['howBuyer1', 'howBuyer2', 'howBuyer3']],
                ['howSellerTitle', ['howSeller1', 'howSeller2', 'howSeller3']],
              ] as Array<[DictKey, DictKey[]]>
            ).map(([h, items]) => (
              <div key={h}>
                <h3 className="t-headline">{t(h)}</h3>
                <ol className="mt-3 list-decimal space-y-2 ps-5 text-[17px] text-white/75">
                  {items.map((k) => (
                    <li key={k}>{t(k)}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-white/60">
            {t('launched')}: <bdi className="tabular">{locale === 'ar' ? '25 يونيو 2023' : '25 June 2023'}</bdi>
          </p>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S14 FAQ (US-HELP-01): grouped accordion + live search                */
/* ------------------------------------------------------------------ */
const GROUPS: Array<[Faq['group'], DictKey]> = [
  ['general', 'faqGeneral'],
  ['listing', 'faqListing'],
  ['fees', 'faqFees'],
  ['trust', 'faqTrust'],
  ['support', 'faqSupport'],
];

/** Mock answers in the data start with "(مقترح)"; that is an internal marker, not user-facing copy. */
const cleanAnswer = (a: string) => a.replace(/^\(مقترح\)\s*/, '');

export function FaqView() {
  const { t } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
  const nq = normalizeArabic(q.trim());
  const filtered = useMemo(() => (nq ? faqs.filter((f) => normalizeArabic(`${f.question} ${f.answer}`).includes(nq)) : faqs), [nq]);

  return (
    <>
      <PageHeader title={t('faqTitle')} lead={t('faqLead')} className="max-w-[720px]" />
      <div className="container-read pb-28">
        <div role="search" className="relative">
          <label htmlFor="faq-q" className="sr-only">
            {t('faqSearch')}
          </label>
          <Search size={20} aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-label-2" />
          <input
            id="faq-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('faqSearch')}
            className="h-14 w-full rounded-lg bg-fill-3 ps-12 pe-4 text-[17px] outline-none focus:bg-bg focus:shadow-[0_0_0_2px_var(--color-primary)]"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t('noFaq')} action={<ButtonLink href="/contact/">{t('navContact')}</ButtonLink>} />
          </div>
        ) : (
          GROUPS.map(([g, label]) => {
            const items = filtered.filter((f) => f.group === g);
            if (!items.length) return null;
            return (
              <section key={g} className="mt-12" aria-labelledby={`faq-${g}`}>
                <h2 id={`faq-${g}`} className="t-title3 mb-3">
                  {t(label)}
                </h2>
                <ul className="divide-y divide-separator/40 border-y border-separator/40">
                  {items.map((f) => {
                    const isOpen = open === f.id;
                    return (
                      <li key={f.id}>
                        <h3>
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={`faq-a-${f.id}`}
                            id={`faq-q-${f.id}`}
                            onClick={() => setOpen(isOpen ? null : f.id)}
                            className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-start text-[17px] font-bold"
                          >
                            {f.question}
                            <ChevronDown size={20} aria-hidden className={cn('shrink-0 text-label-2 transition-transform duration-300', isOpen && 'rotate-180')} />
                          </button>
                        </h3>
                        <div id={`faq-a-${f.id}`} role="region" aria-labelledby={`faq-q-${f.id}`} hidden={!isOpen} className="pb-5 text-[17px] leading-[1.8] text-label-2">
                          {cleanAnswer(f.answer)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
        <div className="mt-16 flex flex-col items-start gap-3 rounded-xl bg-bg-2 p-6">
          <h2 className="t-headline">{t('faqMore')}</h2>
          <ButtonLink href="/contact/" variant="tinted">
            {t('navContact')}
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S14 Contact (US-HELP-02): subject select, required markers, no IBAN  */
/* ------------------------------------------------------------------ */
export function ContactView() {
  const { t } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: 'subjectGeneral', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = t('required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = t('emailInvalid');
    if (form.message.trim().length < 20) er.message = t('minChars');
    setErrors(er);
    if (Object.keys(er).length) {
      document.querySelector<HTMLElement>(`[name="${Object.keys(er)[0]}"]`)?.focus();
      return;
    }
    setSent(true);
  };

  return (
    <>
      <PageHeader title={t('contactTitle')} lead={t('contactLead')} />
      <div className="container-page grid gap-12 pb-28 lg:grid-cols-[1fr_360px]">
        {sent ? (
          <div role="status">
            <EmptyState icon={<Mail size={24} aria-hidden />} title={t('contactSent')} body={t('contactSentBody')} action={<ButtonLink href="/">{t('backHome')}</ButtonLink>} />
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex max-w-2xl flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField name="name" label={`${t('contactName')} *`} required autoComplete="name" value={form.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
              <TextField name="email" type="email" label={`${t('contactEmail')} *`} required autoComplete="email" dir="ltr" className="text-start" value={form.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <SelectField name="subject" label={t('contactSubject')} value={form.subject} onChange={(e) => set('subject', e.target.value)}>
              {(['subjectGeneral', 'subjectListing', 'subjectServices', 'subjectPartnership'] as const).map((k) => (
                <option key={k} value={k}>
                  {t(k)}
                </option>
              ))}
            </SelectField>
            <TextArea name="message" label={`${t('contactMessage')} *`} required rows={6} value={form.message} error={errors.message} onChange={(e) => set('message', e.target.value)} />
            <div>
              <Button type="submit" size="lg">
                {t('contactSend')}
              </Button>
            </div>
          </form>
        )}
        <aside className="flex flex-col gap-3">
          <a href={`mailto:${platformContact.email}`} className="flex min-h-16 items-center gap-4 rounded-lg bg-bg-2 px-5 hover:bg-fill-3">
            <Mail size={20} aria-hidden className="text-primary" />
            <span>
              <span className="block text-[13px] text-label-2">{t('email')}</span>
              <bdi className="font-bold">{platformContact.email}</bdi>
            </span>
          </a>
          <a href={platformContact.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center gap-4 rounded-lg bg-bg-2 px-5 hover:bg-fill-3">
            <MessageCircle size={20} aria-hidden className="text-primary" />
            <span>
              <span className="block text-[13px] text-label-2">{t('whatsapp')}</span>
              <bdi dir="ltr" className="font-bold tabular">
                +966 55 534 1403
              </bdi>
            </span>
          </a>
          <div className="flex min-h-16 items-center gap-4 rounded-lg bg-bg-2 px-5 py-3">
            <MapPin size={20} aria-hidden className="text-primary" />
            <span>
              <span className="block text-[13px] text-label-2">{t('address')}</span>
              <span className="font-bold">{platformContact.address}</span>
            </span>
          </div>
          <Link href="/faq/" className="mt-2 inline-flex min-h-11 items-center text-[15px] font-bold text-primary">
            {t('navFaq')}
          </Link>
        </aside>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S13 Login page (deep-link fallback for the sheet)                    */
/* ------------------------------------------------------------------ */
export function LoginView() {
  const { t, user, signIn, showToast } = useApp();
  const router = useRouter();
  const sp = useSearchParams();
  const to = sp.get('to');
  const dest = to && to.startsWith('/') && !to.startsWith('//') ? to : '/dashboard/';
  return (
    <div className="container-page flex justify-center pb-28 pt-28 md:pt-36">
      <div className="w-full max-w-md">
        <h1 className="t-display-m">{t('loginPageTitle')}</h1>
        <p className="mb-8 mt-3 text-[17px] text-label-2">{t('loginLead')}</p>
        {user ? (
          <div className="flex flex-col gap-4 rounded-xl bg-bg-2 p-6">
            <p className="t-headline">
              {t('welcomeBack')}، {user.name}
            </p>
            <ButtonLink href={dest} size="lg" full>
              {t('continue')}
            </ButtonLink>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-3 p-6 shadow-e2 ring-1 ring-separator/30">
            <AuthFlow
              onDone={(u) => {
                signIn(u);
                showToast(t('loggedIn'));
                router.push(dest);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
