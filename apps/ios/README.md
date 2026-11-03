# فرصة وتمكين: iPhone app (`@forsa/ios`)

Expo SDK 58 (React Native 0.88, React 19.3) · Expo Router 58 · TypeScript strict.
It covers the same journeys as the website (S01–S14), reads data from `@forsa/data` and design tokens from `@forsa/tokens`, and is Arabic-first (RTL).

> Concept prototype. Everything is mocked on the device with no backend: sign-in, OTP and Nafath, the NDA e-signature, inquiries, publishing and bookings. Every mocked step shows a **تجريبي** tag. State is saved locally with AsyncStorage.

---

## Open it right now in Safari (no Mac, no install)

**https://azez-moh.github.io/forsa/app/**

This is a browser preview of the same app, built with React Native Web and deployed with the website. Open it in Safari on the iPhone, then **Share → Add to Home Screen** to get a full-screen icon. On a desktop it shows inside a phone-width frame.

The browser preview has the same screens, data and flows: Discover, الفرص, detail, inquiry → NDA → OTP, the Add wizard, Inbox pipeline, Profile, services, consultants, learn, about and FAQ. It is Arabic RTL by default, with English in Profile → اللغة.

These differ from the native app:
- Icons are Lucide outlines drawn to match the SF Symbols.
- Page transitions are web transitions, not the native large-title collapse and zoom.
- There are no haptics.
- Face ID continues in demo mode (تجريبي).
- No local notifications are sent.
- Share uses the Safari share sheet, or copies the link.
- Action sheets use an in-app sheet, and "تمت الصفقة" uses the browser's prompt.

Build it locally with `npm run export:web -w @forsa/ios`; the output goes to `apps/ios/dist-web`. Regenerate the web icon map with `node apps/ios/scripts/gen-web-icons.mjs`.

## Run it on your iPhone

### Option A: Expo Go (fastest, about 5 minutes, no Mac needed)

1. On the iPhone, install **Expo Go** from the App Store. The App Store build only runs the **latest** Expo SDK, so it needs to be the build that supports **SDK 58**. If Expo Go says the project is incompatible, use Option B.
2. On a computer (Mac or PC) with **Node 22.13+ or Node 24 LTS** (React Native 0.88 and Expo 58 don't support Node 20) and the repo cloned:
   ```bash
   cd forsa
   npm install                   # from the repo root (npm workspaces)
   npm start -w @forsa/ios       # = expo start in apps/ios (shows the QR code)
   ```
   `npm run ios` also tries to open the iOS Simulator, so only use it on a Mac with Xcode.
   If the phone and the computer are on different networks, use `npx expo start --tunnel` from `apps/ios`.
3. Scan the QR code with the iPhone Camera. The app opens in Expo Go.
4. **First launch:** the app reloads once by itself to switch into right-to-left. This is expected and only happens once.

What's different in Expo Go:
- The Face ID prompt uses Expo Go's own permission text, not ours.
- The language switch reloads the app through the dev reloader.
- Everything else behaves the same as a real build.

### Option B: Native build on your own iPhone (needs a Mac with Xcode 26+)

One-time setup:
- Plug in the iPhone and tap **Trust This Computer**.
- On the iPhone, turn on **Settings → Privacy & Security → Developer Mode**. iOS asks you to restart.
- The first build runs `expo prebuild` and CocoaPods automatically, which takes a few minutes. When Xcode asks for a **Team**, pick your Apple ID. A free account works for 7-day installs; the app uses local notifications only, so no push entitlement is needed.
- After the first install, trust the developer profile under **Settings → General → VPN & Device Management**.

**B1. Debug build (for development, needs Metro running)**
```bash
cd forsa && npm install
cd apps/ios
npx expo run:ios --device                            # pick your iPhone
```
The app loads its JavaScript from Metro on your Mac, so keep the terminal open and the phone on the same Wi-Fi. The language switch reloads through the dev reloader.

**B2. Release build (standalone, best for the pitch)**
```bash
cd apps/ios
npx expo run:ios --device --configuration Release
```
The JavaScript is bundled into the app, so it runs without the Mac. It shows the real Arabic and English Face ID text and the Arabic home-screen name, and the language switch restarts the app with `expo-updates` (`Updates.reloadAsync`).

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
| S05 | Add wizard (center **+**): type → basics (fields depend on the type) → numbers (price in words, "did you mean" fix) → photos (long-press to reorder) and confidential files → review with quality flags and the 2.5% commission disclosed at **انشر الفرصة** → card flies into فرصي | `src/app/listing/new.tsx` |
| S06 | Inbox: owner pipeline (جديد → السرية → النقاش → اجتماع → مغلق), swipe actions, "نقل إلى…", grant access, decline, deal closed; investor conversations | `src/app/(tabs)/inbox/index.tsx` |
| S06 | Profile: فرصي with stats, محفوظاتي, طلباتي, خدماتي ومواعيدي, language toggle, About and FAQ | `src/app/(tabs)/profile/index.tsx` |
| S07–S08 | Services catalog and detail + request (providers with 0 orders show **مقدم خدمة جديد**) | `src/app/services/*` |
| S09–S10 | Consultants list and profile + slot booking (fewer than 3 reviews shows **جديد على المنصة**) | `src/app/consultants/*` |
| S11–S12 | Culture center videos (open YouTube in an in-app Safari sheet) and articles with linked opportunities | `src/app/learn/*` |
| S13 | Auth sheet, shown only when an action needs it (inquiry, publish, service request, booking, save search): +966 phone → OTP (one-time-code autofill) → name and one or more roles; mocked Nafath | `src/app/auth/index.tsx` |
| S14 | About + contact, FAQ | `src/app/about.tsx`, `src/app/faq.tsx` |

### Demo script (about 3 minutes)
The demo account plays two roles. It is an **investor** on any listing, and the **owner** of listing **#1124** (مركز رعاية نهارية). Use **#704** (ورق عنب، 9 فروع) or **#932** for the investor path; both are featured NDA listings owned by someone else. #1124 is kept out of the featured strip on purpose.

**Investor path (#704 or #932)**
1. **Discover:** watch the counter roll up, then tap the first featured card (#704). It zooms into the detail; scroll to see the parallax.
2. Tap **طلب تواصل**. Write a message, tap **متابعة** and sign in with any `5XXXXXXXX` number and any 4-digit code.
3. Sign the NDA by typing your full name, then enter the OTP. The success screen appears with a haptic, and a card offers to turn on notifications (تجريبي). Tap **فعّل التنبيهات** and allow.
4. Back on the detail page, tap **محاكاة موافقة المالك** (تجريبي). A local notification arrives. Open a document: Face ID appears and the document opens with a watermark.

**Owner path (#1124)**
5. **Inbox → الطلبات الواردة:** these are inquiries on #1124. Swipe a row to move it to the next stage, long-press for **نقل إلى…**, or open one and tap **منح الوصول للمستندات** or **تمت الصفقة**.
6. Tap **+** and publish a listing. Accept the commission, then tap **انشر الفرصة**. The card flies into فرصي and flips from قيد المراجعة to منشورة, and about 8 seconds later a mock **استفسار جديد على فرصتك** notification opens the Inbox.
7. Opening #1124 while signed in shows **إدارة الفرصة** instead of طلب تواصل.

### HIG details
- System font: SF Arabic and SF Pro are picked automatically. Sizes come from the Dynamic Type scale in the tokens, and Arabic gets extra line height.
- Buttons come in filled, tinted, gray, plain and destructive variants, at heights 28 / 34 / 50 (radius 12 for large). Every one has a hit target of at least 44pt, scales to 0.97 when pressed (reanimated spring), and gives a light haptic.
- Haptics: selection for tabs, segments and filters; light for save; success when an NDA is signed, a listing is published, a booking is confirmed or an inquiry is sent; error on validation failures.
- Native large titles collapse into a blurred nav bar (`headerLargeTitle` + `headerTransparent` + `headerBlurEffect`). The floating tab bar is an `expo-blur` glass capsule.
- Icons are SF Symbols via `expo-symbols`, with text fallbacks. Directional chevrons mirror in RTL.
- With Reduce Motion on, the counter shows its final value right away, parallax is off, and transitions become crossfades.
- Dynamic Type: text scales up to 2.4× (AX3). Buttons, chips, day cells and OTP boxes use minimum heights and grow with the text.
- VoiceOver: cards read as one element, toasts and validation errors are announced, and icon-only buttons are labelled.
- Notifications (US-IOS-05): local only, no APNs. The permission explainer appears after the first inquiry, never at launch. Each notification carries a "تجريبي" subtitle and deep-links into the app.
- Face ID: if a device has no biometrics or passcode (for example the simulator), the document opens with a "demo mode" notice instead of being blocked. This is deliberate for the demo; a production app would refuse.

### Language / RTL
Arabic (RTL) is the default. **Profile → اللغة → English** switches to LTR. React Native only applies a direction change after a restart, so the app asks and then reloads itself: `expo-updates` `reloadAsync` in Release builds (this works without an update URL), and the dev reloader in Debug and Expo Go. If neither is possible, the app says so and you close and reopen it. At launch, the splash screen hides after 2.5 s at the latest, whatever direction the app is in. Listing content stays in Arabic in English mode, because the source data is Arabic.

### Monorepo
`metro.config.js` watches the repo root and resolves `node_modules` from the app first and then the root. It also pins one copy of `react`, because `apps/web` hoists a newer React patch to the root.

## Before you pitch: things to do on a Mac
- [ ] Replace `assets/icon.png` and `assets/splash-icon.png` with the real Forsa logo (they are placeholders now). Use a 1024×1024 PNG with no transparency for the icon.
- [ ] Test on a real iPhone running iOS 18 or later. The card → detail zoom transition is iOS 18+; older versions fall back to a normal push.
- [ ] Optional: `npx expo prebuild -p ios`, then open `ios/*.xcworkspace` to check signing and capabilities.
