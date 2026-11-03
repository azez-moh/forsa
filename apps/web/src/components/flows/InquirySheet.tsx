'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { Opportunity } from '@forsa/data';
import { useApp } from '@/lib/store';
import { Sheet } from '@/components/ui/Sheet';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SelectField, TextArea, TextField, CheckboxRow } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { DemoTag } from '@/components/ui/Badge';
import { Stepper } from '@/components/ui/Stepper';
import { OtpInput } from './OtpInput';

type Step = 'message' | 'nda' | 'otp' | 'success';

/**
 * S04 Inquiry + NDA (US-INQ-02, US-INQ-03, US-INQ-04):
 * message → NDA review (checkbox + typed-name e-sign) → OTP (mock, any 4 digits) → success.
 * Listings without an NDA skip the agreement step. The new inquiry appears in the S06 pipeline.
 */
export function InquirySheet({ o, open, onClose }: { o: Opportunity; open: boolean; onClose: () => void }) {
  const { t, user, addInquiry } = useApp();
  const reduce = useReducedMotion();
  const steps: Step[] = o.ndaRequired ? ['message', 'nda', 'otp'] : ['message', 'otp'];
  const [step, setStep] = useState<Step>('message');
  const [message, setMessage] = useState(t('inqMessageDefault'));
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState<'timelineNow' | 'timeline3' | 'timeline6'>('timeline3');
  const [role, setRole] = useState<'roleInvestor' | 'roleCompany' | 'roleFund'>('roleInvestor');
  const [agree, setAgree] = useState(false);
  const [sig, setSig] = useState(user?.name ?? '');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const msgRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setStep('message');
      setErrors({});
      setCode('');
      setAgree(false);
      setSig(user?.name ?? '');
    }
  }, [open, user?.name]);

  const nextFromMessage = () => {
    if (message.trim().length < 20) {
      setErrors({ message: message.trim() ? t('minChars') : t('inqMessageError') });
      msgRef.current?.focus();
      return;
    }
    setErrors({});
    setStep(o.ndaRequired ? 'nda' : 'otp');
  };
  const nextFromNda = () => {
    const e: Record<string, string> = {};
    if (!agree) e.agree = t('required');
    if (sig.trim().length < 3) e.sig = t('required');
    setErrors(e);
    if (!e.agree && !e.sig) setStep('otp');
  };
  const confirm = () => {
    if (!/^\d{4}$/.test(code)) {
      setErrors({ code: t('wrongCode') });
      return;
    }
    const budgetNum = Number(budget.replace(/[^\d]/g, ''));
    addInquiry({
      opportunityId: o.id,
      counterpart: o.title,
      message: message.trim(),
      budgetSar: budgetNum > 0 ? budgetNum : undefined,
      status: o.ndaRequired ? 'nda-signed' : 'new',
      signedName: o.ndaRequired ? sig.trim() : undefined,
      signedAt: o.ndaRequired ? new Date().toISOString() : undefined,
    });
    setStep('success');
  };

  const idx = Math.max(0, steps.indexOf(step));
  const stepLabels = steps.map((s) => t(s === 'message' ? 'inqStepMessage' : s === 'nda' ? 'inqStepNda' : 'inqStepOtp'));

  const footer =
    step === 'success' ? (
      <div className="flex gap-3">
        <Button variant="gray" size="lg" onClick={onClose}>
          {t('done')}
        </Button>
        <ButtonLink href="/dashboard/?tab=pipeline" size="lg" full>
          {t('goDashboard')}
        </ButtonLink>
      </div>
    ) : (
      <div className="flex gap-3">
        {step !== 'message' && (
          <Button variant="gray" size="lg" onClick={() => setStep(steps[idx - 1])}>
            {t('back')}
          </Button>
        )}
        {step === 'message' && (
          <Button size="lg" full onClick={nextFromMessage}>
            {t('next')}
          </Button>
        )}
        {step === 'nda' && (
          <Button size="lg" full onClick={nextFromNda}>
            {t('signNda')}
          </Button>
        )}
        {step === 'otp' && (
          <Button size="lg" full onClick={confirm} disabled={code.length < 4}>
            {t('confirm')}
          </Button>
        )}
      </div>
    );

  return (
    <Sheet open={open} onClose={onClose} title={step === 'success' ? t('inquirySent') : t('inqTitle')} description={step === 'success' ? undefined : o.title} closeLabel={t('close')} footer={footer}>
      {step !== 'success' && (
        <div className="mb-6">
          <Stepper steps={stepLabels} current={idx} label={t('inqTitle')} stepWord={t('stepOf')} ofWord={t('of')} />
        </div>
      )}

      <motion.div key={step} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
        {step === 'message' && (
          <div className="flex flex-col gap-5">
            <TextArea ref={msgRef} label={t('inqMessageLabel')} hint={t('inqMessageHint')} error={errors.message} value={message} onChange={(e) => setMessage(e.target.value)} rows={5} data-autofocus />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label={t('inqBudget')} optionalLabel={t('optional')} inputMode="numeric" dir="ltr" className="text-start tabular" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d,]/g, ''))} />
              <SelectField label={t('inqRole')} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                <option value="roleInvestor">{t('roleInvestor')}</option>
                <option value="roleCompany">{t('roleCompany')}</option>
                <option value="roleFund">{t('roleFund')}</option>
              </SelectField>
            </div>
            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">{t('timeline')}</legend>
              <div className="flex flex-wrap gap-2">
                {(['timelineNow', 'timeline3', 'timeline6'] as const).map((k) => (
                  <Chip key={k} selected={timeline === k} onClick={() => setTimeline(k)}>
                    {t(k)}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 'nda' && (
          <div className="flex flex-col gap-5">
            <div className="rounded-lg bg-bg-2 p-5">
              <h3 className="t-headline mb-3">{t('ndaTitle')}</h3>
              <ul className="list-disc space-y-2 ps-5 text-[15px] leading-relaxed text-label-2">
                <li>{t('ndaBody1')}</li>
                <li>{t('ndaBody2')}</li>
                <li>{t('ndaBody3')}</li>
              </ul>
            </div>
            <CheckboxRow checked={agree} onChange={(v) => { setAgree(v); if (v) setErrors((e) => ({ ...e, agree: '' })); }} error={errors.agree || undefined}>
              {t('ndaAgree')}
            </CheckboxRow>
            <TextField label={t('ndaSignLabel')} hint={t('ndaSignHint')} error={errors.sig || undefined} value={sig} onChange={(e) => { setSig(e.target.value); if (errors.sig) setErrors((x) => ({ ...x, sig: '' })); }} autoComplete="name" className="text-[20px] italic" />
          </div>
        )}

        {step === 'otp' && (
          <div className="flex flex-col gap-5 py-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="t-headline">{t('otpTitle')}</h3>
              <DemoTag label={t('demoTag')} />
            </div>
            <p className="text-[15px] text-label-2">{t('otpBody')}</p>
            <OtpInput value={code} onChange={setCode} label={t('otpLabel')} digitLabel={t('otpDigit')} error={!!errors.code} autoFocus />
            <p className="text-[13px] text-label-2">{t('otpHint')}</p>
            {errors.code && (
              <p role="alert" className="text-[13px] text-danger">
                {errors.code}
              </p>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
            <motion.span
              initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 158, damping: 17.6 }}
              className="grid size-20 place-items-center rounded-full bg-primary-tint text-primary"
            >
              <CheckCircle2 size={40} strokeWidth={1.75} aria-hidden />
            </motion.span>
            <h3 className="t-title2">{t('inqSuccessTitle')}</h3>
            <p className="max-w-sm text-[15px] leading-relaxed text-label-2">{t(o.ndaRequired ? 'inqSuccessBody' : 'inqSuccessBodyPlain')}</p>
          </div>
        )}
      </motion.div>
    </Sheet>
  );
}
