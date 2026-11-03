# فرصة وتمكين: iPhone app (`@forsa/ios`)

Expo SDK 58 (React Native 0.88, React 19.3) · Expo Router 58 · TypeScript strict.
It covers the same journeys as the website (S01–S14), reads data from `@forsa/data` and design tokens from `@forsa/tokens`, and is Arabic-first (RTL).

> Concept prototype. Everything is mocked on the device with no backend: sign-in, OTP and Nafath, the NDA e-signature, inquiries, publishing and bookings. Every mocked step shows a **تجريبي** tag. State is saved locally with AsyncStorage.

---

## Run it on your iPhone

### Option A: Expo Go (fastest, about 5 minutes, no Mac needed)

1. On the iPhone, install **Expo Go** from the App Store. It must be the build that supports **SDK 58**.
2. On a computer (Mac or PC) with Node 20+ and the repo cloned:
   ```bash
   cd forsa
   npm install            # from the repo root (npm workspaces)
   npm run ios            # = expo start, inside apps/ios
   ```
   If the phone and the computer are on different networks, use `npx expo start --tunnel` from `apps/ios`.
3. Scan the QR code with the iPhone Camera. The app opens in Expo Go.
4. **First launch:** the app reloads once by itself to switch into right-to-left. This is expected and only happens once.

What's different in Expo Go:
- The Face ID prompt uses Expo Go's own permission text, not ours.
- The language switch reloads the app through the dev reloader.
- Everything else behaves the same as a real build.

### Option B: Native build on your own iPhone (needs a Mac with Xcode 26+)

```bash
cd forsa && npm install
cd apps/ios
npx expo run:ios --device     # choose your plugged-in iPhone
```

- The first time, Xcode asks for a **Team**. Pick your Apple ID; a free account works for 7-day installs.
- On the iPhone, trust the developer profile under **Settings → General → VPN & Device Management**.
- This build uses the real Arabic and English Face ID usage text, the Arabic display name, and `expo-updates` for the language reload.

### Option C: TestFlight with EAS (to share with the Forsa team)

```bash
npm i -g eas-cli
cd apps/ios
eas login
eas build:configure                 # creates eas.json, links an Expo project
eas build -p ios --profile production
eas submit -p ios                   # uploads to App Store Connect → TestFlight
```

This needs a paid **Apple Developer account** ($99/yr) and an App Store Connect app record with bundle ID `sa.forsh.app`. If Forsa owns that ID, build under their team, or change `ios.bundleIdentifier` in `app.json` for a demo build.

---

## Checks (run from the repo root)

```bash
npx tsc --noEmit -p apps/ios                                 # typecheck
cd apps/ios && npx expo export --platform ios                # bundles JS (no Xcode needed)
cd apps/ios && npx expo-doctor                               # needs internet to reach exp.host
```

---

## What's inside

| ID | Screen | File |
|---|---|---|
| S01 | Discover: navy hero whose value counter rolls up to **2.47 مليار ر.س**, four types, featured, cities, how it works, services, consultants, culture center | `src/app/(tabs)/(discover)/index.tsx` |
| S02 | Opportunities: native search bar, type segmented control, filter sheet (category, city, log price steps, stage, verified, equity), sort action sheet, save search, pull to refresh | `src/app/(tabs)/opportunities/index.tsx` |
| S03 | Opportunity detail: parallax hero, native zoom transition from the card, labelled metrics grid (**متاح بعد اتفاقية عدم الإفصاح** instead of 0), trust block, Face ID gated data room, Share sheet, sticky **طلب تواصل** button (owners see **إدارة الفرصة**) | `src/app/opportunity/[id].tsx` |
| S04 | Inquiry form sheet: message, budget, timeline and investor type → NDA summary and full text, typed-name signature → OTP → success | `src/app/inquiry/[id].tsx` |
| S05 | Add wizard (center **+**): type → basics (fields depend on the type) → numbers (price in words, "did you mean" fix) → photos and confidential files → review with the 2.5% commission disclosed at **انشر الفرصة** → card flies into فرصي | `src/app/listing/new.tsx` |
| S06 | Inbox: owner pipeline (جديد → السرية → النقاش → اجتماع → مغلق), swipe actions, "نقل إلى…", grant access, decline, deal closed; investor conversations | `src/app/(tabs)/inbox/index.tsx` |
| S06 | Profile: فرصي with stats, محفوظاتي, طلباتي, خدماتي ومواعيدي, language toggle, About and FAQ | `src/app/(tabs)/profile/index.tsx` |
| S07–S08 | Services catalog and detail + request (providers with 0 orders show **مقدم خدمة جديد**) | `src/app/services/*` |
| S09–S10 | Consultants list and profile + slot booking (fewer than 3 reviews shows **جديد على المنصة**) | `src/app/consultants/*` |
| S11–S12 | Culture center videos (open YouTube in an in-app Safari sheet) and articles with linked opportunities | `src/app/learn/*` |
| S13 | Auth sheet, shown only when an action needs it: +966 phone → OTP (one-time-code autofill) → name and role; mocked Nafath | `src/app/auth/index.tsx` |
| S14 | About + contact, FAQ | `src/app/about.tsx`, `src/app/faq.tsx` |

### Demo script (about 2 minutes)
1. **Discover:** watch the counter roll up, then tap a featured card. It zooms into the detail; scroll to see the parallax.
2. Tap **طلب تواصل**. Write a message, tap **متابعة** and sign in with any `5XXXXXXXX` number and any 4-digit code.
3. Sign the NDA by typing your full name, enter the OTP, and you get the success screen with a haptic.
4. Back on the detail page, tap **محاكاة موافقة المالك** (تجريبي), then open a document. Face ID appears and the document opens with a watermark.
5. Tap **+** to start a listing and go through the steps. Accept the commission and tap **انشر الفرصة**. The card flies into فرصي and flips from قيد المراجعة to منشورة.
6. **Inbox:** swipe an inquiry to move it to the next stage, or long-press it for **نقل إلى…**.

### HIG details
- System font: SF Arabic and SF Pro are picked automatically. Sizes come from the Dynamic Type scale in the tokens, and Arabic gets extra line height.
- Buttons come in filled, tinted, gray, plain and destructive variants, at heights 28 / 34 / 50 (radius 12 for large). Every one has a hit target of at least 44pt, scales to 0.97 when pressed (reanimated spring), and gives a light haptic.
- Haptics: selection for tabs, segments and filters; light for save; success when an NDA is signed, a listing is published, a booking is confirmed or an inquiry is sent; error on validation failures.
- Native large titles collapse into a blurred nav bar (`headerLargeTitle` + `headerTransparent` + `headerBlurEffect`). The floating tab bar is an `expo-blur` glass capsule.
- Icons are SF Symbols via `expo-symbols`, with text fallbacks. Directional chevrons mirror in RTL.
- With Reduce Motion on, the counter shows its final value right away, parallax is off, and transitions become crossfades.

### Language / RTL
Arabic (RTL) is the default. **Profile → اللغة → English** switches to LTR. React Native only applies a direction change after a restart, so the app asks and then reloads itself (`expo-updates` `reloadAsync` in release builds, the dev reloader in Expo Go). Listing content stays in Arabic in English mode, because the source data is Arabic.

### Monorepo
`metro.config.js` watches the repo root and resolves `node_modules` from the app first and then the root. It also pins one copy of `react`, because `apps/web` hoists a newer React patch to the root.

## Before you pitch: things to do on a Mac
- [ ] Replace `assets/icon.png` and `assets/splash-icon.png` with the real Forsa logo (they are placeholders now). Use a 1024×1024 PNG with no transparency for the icon.
- [ ] Test on a real iPhone running iOS 18 or later. The card → detail zoom transition is iOS 18+; older versions fall back to a normal push.
- [ ] Optional: `npx expo prebuild -p ios`, then open `ios/*.xcworkspace` to check signing and capabilities.
