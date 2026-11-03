'use client';

import { useEffect, useState } from 'react';
import { Fingerprint, Phone } from 'lucide-react';
import { useApp, type SessionUser } from '@/lib/store';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { DemoTag } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { OtpInput } from './OtpInput';

type Step = 'phone' | 'otp' | 'nafath' | 'profile';

/**
 * S13 — gate only at the moment of action (US-AUTH-01..04). Phone + OTP, mocked Nafath, then a
 * one-tap role picker with only the name required. No commission pledge here (product decision 2).
 * Every mocked step carries a "تجريبي" tag (product decision 6).
 */
export function AuthFlow({ onDone, compact = false }: { onDone: (u: Omit<SessionUser, 'joinedAt'>) => void; compact?: boolean }) {
  const { t } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [role, setRole] = useState<SessionUser['role']>('buyer');
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const id = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  useEffect(() => {
    if (step !== 'nafath') return;
    const id = setTimeout(() => {
      setVerified(true);
      setStep('profile');
    }, 3000);
    return () => clearTimeout(id);
  }, [step]);

  const sendCode = () => {
    const digits = phone.replace(/\D/g, '').replace(/^966/, '').replace(/^0/, '');
    if (!/^5\d{8}$/.test(digits)) {
      setPhoneErr(t('phoneInvalid'));
      return;
    }
    setPhone(digits);
    setPhoneErr('');
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setTimer(60);
      setStep('otp');
    }, 500);
  };

  const verify = () => {
    if (!/^\d{4}$/.test(code)) {
      setCodeErr(t('wrongCode'));
      return;
    }
    setCodeErr('');
    setStep('profile');
  };

  const finish = () => {
    if (name.trim().length < 2) {
      setNameErr(t('required'));
      return;
    }
    onDone({ name: name.trim(), phone: phone || '5XXXXXXXX', verified, role });
  };

  return (
    <div className="flex flex-col gap-5">
      {step === 'phone' && (
        <>
          <TextField
            label={t('phoneLabel')}
            hint={t('phoneHint')}
            error={phoneErr}
            inputMode="tel"
            autoComplete="tel-national"
            dir="ltr"
            data-autofocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCode()}
            leading={<span className="tabular text-[15px]" dir="ltr">+966</span>}
            className="ps-[4.5rem] text-start"
          />
          <Button size="lg" full onClick={sendCode} loading={busy} icon={<Phone size={18} aria-hidden />}>
            {t('sendCode')}
          </Button>
          <div className="flex items-center gap-3 text-[13px] text-label-2" aria-hidden>
            <span className="h-px flex-1 bg-separator/50" />
            {t('or')}
            <span className="h-px flex-1 bg-separator/50" />
          </div>
          <Button size="lg" variant="gray" full onClick={() => setStep('nafath')} icon={<Fingerprint size={18} aria-hidden />}>
            {t('nafath')}
            <DemoTag label={t('demoTag')} />
          </Button>
          {!compact && <p className="text-center text-[13px] text-label-2">{t('termsNote')}</p>}
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="t-headline">{t('otpTitle')}</h3>
              <DemoTag label={t('demoTag')} />
            </div>
            <p className="mt-1 text-[15px] text-label-2">
              {t('otpBody')} <bdi dir="ltr" className="tabular">+966 {phone}</bdi>
            </p>
          </div>
          <OtpInput value={code} onChange={setCode} label={t('otpLabel')} digitLabel={t('otpDigit')} error={!!codeErr} autoFocus />
          <p className="text-center text-[13px] text-label-2">{t('otpHint')}</p>
          {codeErr && <p role="alert" className="text-center text-[13px] text-danger">{codeErr}</p>}
          <Button size="lg" full onClick={verify} disabled={code.length < 4}>
            {t('confirm')}
          </Button>
          <button type="button" disabled={timer > 0} onClick={() => setTimer(60)} className="min-h-11 text-[15px] text-primary disabled:text-label-3">
            {timer > 0 ? (
              <>
                {t('resendIn')} <bdi className="tabular">{timer}</bdi>
                {t('seconds')}
              </>
            ) : (
              t('resend')
            )}
          </button>
        </>
      )}

      {step === 'nafath' && (
        <div className="flex flex-col items-center gap-4 py-4 text-center" aria-live="polite">
          <DemoTag label={t('demoTag')} />
          <p className="text-[15px] text-label-2">{t('nafathBody')}</p>
          <div className="grid size-24 place-items-center rounded-xl bg-primary-tint text-[44px] font-extrabold tabular text-primary">47</div>
          <p className="flex items-center gap-2 text-[15px] text-label-2">
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary border-e-transparent motion-reduce:animate-none" aria-hidden />
            {t('nafathWaiting')}
          </p>
          <Button variant="plain" onClick={() => setStep('phone')}>
            {t('back')}
          </Button>
        </div>
      )}

      {step === 'profile' && (
        <>
          <TextField label={t('nameLabel')} value={name} onChange={(e) => setName(e.target.value)} error={nameErr} autoComplete="name" data-autofocus />
          <div>
            <p className="mb-2 text-[15px] font-bold">{t('roleLabel')}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('roleLabel')}>
              {(
                [
                  ['buyer', 'roleBuyer'],
                  ['seller', 'roleSeller'],
                  ['both', 'roleBoth'],
                ] as const
              ).map(([v, k]) => (
                <Chip key={v} selected={role === v} onClick={() => setRole(v)}>
                  {t(k)}
                </Chip>
              ))}
            </div>
          </div>
          <Button size="lg" full onClick={finish}>
            {t('continue')}
          </Button>
        </>
      )}
    </div>
  );
}

export function AuthSheet() {
  const { authOpen, closeAuth, completeAuth, t, showToast } = useApp();
  return (
    <Sheet open={authOpen} onClose={closeAuth} title={t('loginTitle')} description={t('loginLead')} closeLabel={t('close')} size="sm">
      {authOpen && (
        <AuthFlow
          onDone={(u) => {
            completeAuth(u);
            showToast(t('loggedIn'));
          }}
        />
      )}
    </Sheet>
  );
}
