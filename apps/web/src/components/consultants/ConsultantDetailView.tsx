'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarCheck, Clock, Globe, Info } from 'lucide-react';
import type { Consultant } from '@forsa/data';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Breadcrumbs } from '@/components/layout/PageHeader';
import { ConsultantAvatar, ReputationLabel } from '@/components/ui/Reputation';

const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = ['10:00', '11:00', '13:00', '16:00', '17:00', '19:00', '20:00'];

/** Deterministic mock availability (Sun–Thu, Riyadh time), so static export and client agree. */
function slotsFor(consultantId: number, date: Date): string[] {
  const dow = date.getDay();
  if (dow === 5 || dow === 6) return [];
  const seed = (consultantId * 31 + date.getDate() * 7) % SLOTS.length;
  return SLOTS.filter((_, i) => (i + seed) % 3 !== 0);
}

/** S10 Consultant profile + booking (US-CNS-02..04): 14-day strip and slots visible to guests; sign-in only at confirm. */
export function ConsultantDetailView({ c }: { c: Consultant }) {
  const { t, locale, requireAuth, addRequest } = useApp();
  // Dates are computed after mount so the statically exported HTML never disagrees with the viewer's clock.
  const [days, setDays] = useState<Date[]>([]);
  const [day, setDay] = useState(-1);
  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const list = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i + 1);
      return d;
    });
    setDays(list);
    setDay(list.findIndex((d) => slotsFor(c.id, d).length > 0));
  }, [c.id]);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const daySlots = day >= 0 && days[day] ? slotsFor(c.id, days[day]) : [];
  const dayName = (d: Date) => (locale === 'ar' ? AR_DAYS : EN_DAYS)[d.getDay()];
  const slotLabel = day >= 0 && days[day] && slot ? `${dayName(days[day])} ${days[day].getDate()}/${days[day].getMonth() + 1} · ${slot}` : '';

  const onBook = () => {
    if (!slot) return;
    requireAuth(() => {
      setBooked(false);
      setConfirmOpen(true);
    });
  };
  const confirm = () => {
    addRequest({ kind: 'booking', refId: c.id, title: `${t('book')}: ${c.name}`, slot: `${slotLabel} (${t('riyadhTime')})` });
    setBooked(true);
  };

  return (
    <article className="pb-32 pt-20 md:pt-24">
      <div className="container-page">
        <Breadcrumbs label={t('breadcrumbHome')} items={[{ href: '/consultants/', label: t('navConsultants') }, { label: c.name }]} />
      </div>
      <div className="container-page mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ConsultantAvatar name={c.name} size="lg" />
            <div>
              <h1 className="t-display-m flex items-center gap-2">
                {c.name}
                {c.certified && <BadgeCheck size={28} aria-label={t('certified')} className="text-success" />}
              </h1>
              <p className="mt-1 text-[19px] text-label-2">{c.specialty}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {c.certified && <Badge tone="success">{t('certified')}</Badge>}
                <Badge>
                  <bdi className="tabular">{c.yearsExperience}</bdi>&nbsp;{t('yearsExp')}
                </Badge>
                <ReputationLabel reviews={c.reviews} rating={c.rating} />
              </div>
            </div>
          </div>

          <section className="mt-12" aria-labelledby="bio-h">
            <h2 id="bio-h" className="t-title2 mb-4">
              {t('profile')}
            </h2>
            <p className="max-w-[65ch] text-[17px] leading-[1.9]">{c.bio}</p>
          </section>
          <section className="mt-10" aria-labelledby="tags-h">
            <h2 id="tags-h" className="t-title2 mb-4">
              {t('expertise')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {c.tags.map((x) => (
                <li key={x} className="rounded-full bg-fill-3 px-4 py-2 text-[15px]">
                  {x}
                </li>
              ))}
            </ul>
          </section>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Globe size={20} aria-hidden className="mt-0.5 text-label-2" />
              <div>
                <dt className="text-[13px] text-label-2">{t('languages')}</dt>
                <dd className="t-headline">{c.languages.join('، ')}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock size={20} aria-hidden className="mt-0.5 text-label-2" />
              <div>
                <dt className="text-[13px] text-label-2">{t('availability')}</dt>
                <dd className="t-headline">{c.availability}</dd>
              </div>
            </div>
          </dl>
          <p className="mt-10 flex items-start gap-2 rounded-lg bg-bg-2 p-4 text-[15px] text-label-2">
            <Info size={17} aria-hidden className="mt-0.5 shrink-0" /> {t('consultDisclaimer')}
          </p>
        </div>

        {/* Slot picker */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start" aria-labelledby="book-h">
          <div className="rounded-xl bg-bg-3 p-6 shadow-e2 ring-1 ring-separator/30">
            <div className="flex items-baseline justify-between">
              <h2 id="book-h" className="t-title3">
                {t('bookTitle')}
              </h2>
              <p className="text-[15px]">
                <bdi className="tabular font-bold">{c.feeSar}</bdi> {t('bookingFee')}
              </p>
            </div>
            <fieldset className="mt-5 min-w-0">
              <legend className="mb-2 text-[13px] text-label-2">{t('bookDay')}</legend>
              <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1" role="radiogroup" aria-label={t('bookDay')}>
                {days.map((d, i) => {
                  const avail = slotsFor(c.id, d).length > 0;
                  const active = i === day;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={!avail}
                      onClick={() => {
                        setDay(i);
                        setSlot(null);
                      }}
                      className={cn(
                        'flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md text-[13px] transition-colors',
                        active ? 'bg-label text-bg' : 'bg-fill-3 text-label hover:bg-fill-2',
                        !avail && 'opacity-40',
                      )}
                    >
                      <span>{dayName(d)}</span>
                      <span className="tabular text-[17px] font-bold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="mt-5 min-w-0">
              <legend className="mb-2 text-[13px] text-label-2">
                {t('bookSlot')} · {t('riyadhTime')}
              </legend>
              {daySlots.length ? (
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('bookSlot')}>
                  {daySlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={slot === s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        'h-11 rounded-md text-[15px] font-bold tabular transition-colors',
                        slot === s ? 'bg-primary text-on-primary' : 'bg-primary-tint text-primary hover:brightness-95',
                      )}
                    >
                      <bdi dir="ltr">{s}</bdi>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-label-2">{t('noSlots')}</p>
              )}
            </fieldset>
            <Button size="lg" full className="mt-6" disabled={!slot} onClick={onBook} icon={<CalendarCheck size={18} aria-hidden />}>
              {slot ? t('book') : t('pickSlotFirst')}
            </Button>
            <p className="mt-3 text-center text-[13px] text-label-2">{t('feeNote')}</p>
          </div>
        </aside>
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={booked ? t('booked') : t('bookConfirm')}
        closeLabel={t('close')}
        size="sm"
        footer={
          booked ? (
            <div className="flex gap-3">
              <Button variant="gray" size="lg" onClick={() => setConfirmOpen(false)}>
                {t('done')}
              </Button>
              <ButtonLink href="/dashboard/?tab=requests" size="lg" full>
                {t('goDashboard')}
              </ButtonLink>
            </div>
          ) : (
            <Button size="lg" full onClick={confirm}>
              {t('bookConfirm')}
            </Button>
          )
        }
      >
        {booked ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
            <span className="grid size-20 place-items-center rounded-full bg-primary-tint text-primary">
              <CalendarCheck size={36} strokeWidth={1.75} aria-hidden />
            </span>
            <p className="max-w-sm text-[15px] text-label-2">{t('bookedBody')}</p>
          </div>
        ) : (
          <dl className="divide-y divide-separator/40 rounded-lg ring-1 ring-separator/40">
            {[
              [t('navConsultants'), c.name],
              [t('bookSlot'), `${slotLabel} (${t('riyadhTime')})`],
              [t('duration'), locale === 'ar' ? '30 دقيقة' : '30 minutes'],
              [t('fee'), locale === 'ar' ? `${c.feeSar} ر.س` : `SAR ${c.feeSar}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
                <dt className="text-label-2">{k}</dt>
                <dd className="text-end font-bold">
                  <bdi>{v}</bdi>
                </dd>
              </div>
            ))}
            <p className="px-4 py-3 text-[13px] text-label-2">{t('feeTerms')}</p>
          </dl>
        )}
      </Sheet>
    </article>
  );
}
