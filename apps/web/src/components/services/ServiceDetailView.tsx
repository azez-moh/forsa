'use client';

import { useState } from 'react';
import { BadgeCheck, CheckCircle2, Clock, FileText, Info, MapPin } from 'lucide-react';
import { getCity, type Service } from '@forsa/data';
import { useApp } from '@/lib/store';
import { formatSAR } from '@/lib/format';
import { discountPercent, providerOf, serviceDuration } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { SelectField, TextArea } from '@/components/ui/TextField';
import { Breadcrumbs } from '@/components/layout/PageHeader';
import { SERVICE_ICON } from './ServicesView';

/** S08 Service detail + request (US-SRV-02, US-SRV-03). Provider with 0 orders → "مقدم خدمة جديد". */
export function ServiceDetailView({ s }: { s: Service }) {
  const { t, locale, requireAuth, addRequest, listings } = useApp();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState('');
  const [noteErr, setNoteErr] = useState('');
  const [link, setLink] = useState('');
  const p = providerOf(s);
  const off = discountPercent(s);
  const dur = serviceDuration(s, locale);
  const Icon = SERVICE_ICON[s.categoryId];

  const submit = () => {
    if (note.trim().length < 10) {
      setNoteErr(t('required'));
      return;
    }
    addRequest({ kind: 'service', refId: s.id, title: s.title, note: note.trim(), linkedListing: link || undefined });
    setDone(true);
  };

  return (
    <article className="pb-32 pt-20 md:pt-24">
      <div className="container-page">
        <Breadcrumbs label={t('breadcrumbHome')} items={[{ href: '/services/', label: t('navServices') }, { label: s.title }]} />
      </div>
      <div className="container-page mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <span className="grid size-14 place-items-center rounded-lg bg-primary-tint text-primary">
            <Icon size={26} aria-hidden />
          </span>
          <h1 className="t-display-m mt-6">{s.title}</h1>
          <p className="mt-4 max-w-[65ch] text-[19px] leading-relaxed text-label-2">{s.description}</p>

          <div className="mt-12 grid gap-10">
            <section aria-labelledby="deliv-h">
              <h2 id="deliv-h" className="t-title2 mb-4">
                {locale === 'ar' ? 'ماذا ستحصل عليه' : 'What you get'}
              </h2>
              {s.deliverables?.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[17px]">
                      <CheckCircle2 size={18} aria-hidden className="mt-1 shrink-0 text-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[17px] text-label-2">{s.description}</p>
              )}
            </section>
            {s.requirements?.length ? (
              <section aria-labelledby="req-h">
                <h2 id="req-h" className="t-title2 mb-4">
                  {locale === 'ar' ? 'المطلوب منك' : 'What we need from you'}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {s.requirements.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[17px]">
                      <FileText size={18} aria-hidden className="mt-1 shrink-0 text-label-2" />
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {dur && (
              <section aria-labelledby="dur-h">
                <h2 id="dur-h" className="t-title2 mb-3">
                  {locale === 'ar' ? 'مدة التنفيذ' : 'Timeline'}
                </h2>
                <p className="flex items-center gap-2 text-[17px]">
                  <Clock size={18} aria-hidden className="text-label-2" /> {dur}
                </p>
              </section>
            )}
            {s.disclaimer && (
              <p className="flex items-start gap-2 rounded-lg bg-bg-2 p-4 text-[15px] text-label-2">
                <Info size={17} aria-hidden className="mt-0.5 shrink-0" /> {s.disclaimer}
              </p>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl bg-bg-3 p-6 shadow-e2 ring-1 ring-separator/30">
            <p className="text-[13px] text-label-2">{t('startsFrom')}</p>
            <p className="t-display-m tabular">
              <bdi>{formatSAR(s.priceSar, locale)}</bdi>
            </p>
            {off && s.originalPriceSar && (
              <p className="mt-1 flex items-center gap-2 text-[15px] text-label-2">
                <s>
                  <bdi className="tabular">{formatSAR(s.originalPriceSar, locale)}</bdi>
                </s>
                <Badge tone="primary">
                  <bdi className="tabular">-{off}%</bdi>
                </Badge>
              </p>
            )}
            <p className="mt-2 text-[13px] text-label-2">{t('vat')}</p>
            <Button size="lg" full className="mt-6" onClick={() => requireAuth(() => { setDone(false); setOpen(true); })}>
              {t('requestService')}
            </Button>
          </div>
          {p && (
            <section className="mt-4 rounded-xl bg-bg-2 p-6" aria-labelledby="prov-h">
              <h2 id="prov-h" className="text-[13px] text-label-2">
                {t('provider')}
              </h2>
              <p className="t-headline mt-1">{p.name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.certified && (
                  <Badge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
                    {t('certified')}
                  </Badge>
                )}
                {p.completedOrders > 0 ? (
                  <Badge>
                    <bdi className="tabular">{p.completedOrders}</bdi>&nbsp;{t('completedOrders')}
                  </Badge>
                ) : (
                  <Badge>{t('newProvider')}</Badge>
                )}
              </div>
              {p.cityId && (
                <p className="mt-3 flex items-center gap-1 text-[15px] text-label-2">
                  <MapPin size={15} aria-hidden /> {getCity(p.cityId)?.name[locale]}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={done ? t('serviceRequested') : t('serviceRequestTitle')}
        description={done ? undefined : s.title}
        closeLabel={t('close')}
        footer={
          done ? (
            <div className="flex gap-3">
              <Button variant="gray" size="lg" onClick={() => setOpen(false)}>
                {t('done')}
              </Button>
              <ButtonLink href="/dashboard/?tab=requests" size="lg" full>
                {t('goDashboard')}
              </ButtonLink>
            </div>
          ) : (
            <Button size="lg" full onClick={submit}>
              {t('requestService')}
            </Button>
          )
        }
      >
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
            <span className="grid size-20 place-items-center rounded-full bg-primary-tint text-primary">
              <CheckCircle2 size={40} strokeWidth={1.75} aria-hidden />
            </span>
            <p className="max-w-sm text-[15px] text-label-2">{t('serviceRequestedBody')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <TextArea label={t('serviceDetails')} hint={t('serviceDetailsHint')} error={noteErr} value={note} onChange={(e) => setNote(e.target.value)} rows={5} data-autofocus />
            <SelectField label={t('linkToListing')} optionalLabel={t('optional')} value={link} onChange={(e) => setLink(e.target.value)}>
              <option value="">{t('none')}</option>
              {listings.map((l) => (
                <option key={l.id} value={l.title}>
                  {l.title}
                </option>
              ))}
            </SelectField>
          </div>
        )}
      </Sheet>
    </article>
  );
}
