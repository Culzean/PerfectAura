# HairAdvisor — Claude Code Project Plan

## Project Overview

A React Native (Expo) Android app that analyses a user's current hair via photos and text notes, then uses AI to recommend a haircut. Output is a structured recommendation rendered across purpose-built UI sections, plus an AI-generated "after" image.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Expo (React Native) | TypeScript, Android-primary |
| UI Library | Tamagui | Pin versions explicitly — see notes below |
| Navigation | React Navigation (Native Stack) | @react-navigation/native + @react-navigation/native-stack |
| Image Generation | Replicate API | InstantID or IP-Adapter + SDXL |
| Vision / Reasoning | Anthropic Claude API | claude-sonnet-4-20250514, vision |
| Hosting (API proxy) | Vercel or Railway | Required before production |
| Image Picker | expo-image-picker | Camera + gallery |
| File System | expo-file-system | Base64 encoding of images |

---

## App Structure

```
/app
  App.tsx                        # Root — NavigationContainer + context providers
  /navigation
    RootNavigator.tsx            # Native stack definition and screen registration
  /context
    SessionContext.tsx           # Session state — user name, results list, input state
  /screens
    HomeScreen.tsx               # Name input + Get Started + History button
    InputScreen.tsx
    LoadingScreen.tsx
    ResultsScreen.tsx            # Renders from route params (fresh or history entry)
    HistoryScreen.tsx            # Session consultation list
    StylePickerScreen.tsx        # Phase 3 — curated style grid modal
  /services
    hairAdvisor.ts               # All API logic — Claude + Replicate calls
    replicate.ts                 # Replicate helpers (Phase 2)
  /components
    PhotoPicker.tsx              # "Add your own" image picker (gallery/camera)
    PhotoGrid.tsx                # Displays selected photos
    ReferenceSection.tsx         # Container for reference photos — owns both entry points
    ResultCard.tsx               # After image placeholder / real image (Phase 2)
    RecommendationDetail.tsx     # Renders structured recommendation fields
    ConsultationSummary.tsx      # History list item — name, date, cut name
  /config
    env.ts                       # API keys from environment variables
  /types
    index.ts                     # Shared TypeScript types
  tamagui.config.ts              # Tamagui theme and token configuration
```

---

## Screen Flow

```
Home -> Input -> Loading -> Results (fresh)
  |                             |
  |                         (trash icon — delete entry, pop to History or Home)
  |                         (back — pop to Input, state intact)
  |                         (Try Another — pop to Input, state intact)
  |                         (Start Over — popToTop, reset session input)
  |
History -> Results (historical, read-only origin)
                |
            (back — pop to History)
            (trash icon — delete entry, pop to History)
```

StylePickerScreen presented as modal from Input. Phase 3.

---

## Session State

All session state lives in `SessionContext`. This is the single source of truth for the current session. It is NOT persisted to device storage — it resets when the app closes.

```typescript
// context/SessionContext.tsx

interface SessionState {
  // User identity
  userName: string;
  setUserName: (name: string) => void;

  // Current input — persists across stack pops so Input state survives back navigation
  currentPhotos: PhotoAsset[];
  referencePhotos: PhotoAsset[];
  notes: string;
  setCurrentPhotos: (photos: PhotoAsset[]) => void;
  setReferencePhotos: (photos: PhotoAsset[]) => void;
  setNotes: (notes: string) => void;

  // Consultation history — session only, cleared on app close
  consultations: Consultation[];
  addConsultation: (result: HairAdvisorResult) => void;
  deleteConsultation: (id: string) => void;

  // Reset input fields only (used by Start Over)
  resetInput: () => void;
}
```

`App.tsx` wraps the NavigationContainer in `SessionProvider` and `TamaguiProvider`.

---

## Screen Specifications

### Home Screen
- User name input field at the top — simple text input, label "Your name"
  - Reads from and writes to SessionContext.userName
  - Remembered for the session — pre-filled if already entered
- "Get Started" CTA button — navigates to Input
- "View History" button — navigates to History. Disabled (greyed) if consultations list is empty
- History button becomes active as soon as the first consultation is saved

### Input Screen
Reads and writes via SessionContext. State persists on back-pop from Results.

Three sections in order:

**1. Current Hair Photos** (required, 1-3 photos)
- Gallery or camera picker via PhotoPicker
- PhotoGrid display of selected images
- Minimum 1 photo required before proceeding

**2. Reference Photos** (optional, up to 5 total across all sources)
- Clearly labelled as optional
- Two entry points via ReferenceSection:
  - "Browse styles" — disabled with "Coming soon" label in Phase 1
  - "Add your own" — opens image picker. Active from Phase 1
- Sources mix freely up to the 5 cap
- All selections land in referencePhotos: PhotoAsset[] regardless of source

**3. Notes** (optional, multi-line text input)
- Placeholder: "Describe your hair type, what you like, what frustrates you about your current cut, and any styles you're drawn to."

"Get Recommendation" button — disabled until at least 1 current hair photo is selected. On tap: navigate to Loading and trigger AI pipeline.

### Loading Screen
- Animated indicator
- Text: "Analysing your hair..."
- No back navigation while loading

### Results Screen
Receives a `ResultsScreenParams` object via route params. Renders the same layout whether the entry is fresh or loaded from history. The `origin` param controls back navigation behaviour.

```typescript
interface ResultsScreenParams {
  consultation: Consultation;   // Full consultation record
  origin: 'fresh' | 'history'; // Controls back behaviour
}
```

**Layout (top to bottom):**

1. **After Image** — placeholder card in Phase 1, real image in Phase 2
2. **Cut Name** — large headline text
3. **Recommendation Body** — reasoning and addressesFrustrations rendered as readable paragraphs
4. **Salon Script** — visually distinct card, labelled "How to ask for it". The exact wording for the stylist. Should be easy to find and show at a glance.

**Header actions:**
- Back button (native header):
  - origin 'fresh' — pops to Input (state intact)
  - origin 'history' — pops to History
- Trash icon (native header, right side) — deletes consultation from SessionContext, then pops. Same origin logic applies for where it pops to.

**Footer actions:**
- "Try Another" button — pops to Input (state intact). Only shown when origin is 'fresh'.
- "Start Over" button — calls popToTop(), calls SessionContext.resetInput(). Returns to Home.

### History Screen
- List of past consultations for the current session
- Each entry rendered as ConsultationSummary: user name, date/time of consultation, recommended cut name
- Tap entry — navigates to ResultsScreen with origin: 'history'
- Trash icon on each entry — calls deleteConsultation(id), removes from list in place
- Empty state message if all entries deleted: "No consultations yet"
- Back button returns to Home

### StylePickerScreen (Phase 3)
- Presented as a modal
- Scrollable grid of curated hair style images (bundled local assets)
- Multi-select up to remaining cap (5 minus already selected references)
- "Done" confirms and returns selections to InputScreen via navigation params
- Style images defined in a static catalogue (JSON + image files in /assets)

---

## Data Types

```typescript
// types/index.ts

export type PhotoSource = 'gallery' | 'camera' | 'style-picker';

export interface PhotoAsset {
  uri: string;           // Local file URI — opaque to AI pipeline regardless of source
  base64?: string;       // Populated before API call
  source: PhotoSource;   // For UI only — pipeline ignores this
  styleId?: string;      // Phase 3 — catalogue entry reference if source is style-picker
}

export interface HairAdvisorInput {
  currentPhotos: PhotoAsset[];    // 1-3, required
  referencePhotos: PhotoAsset[];  // 0-5, optional, any source mix
  notes: string;
}

export interface HairRecommendation {
  cutName: string;                 // e.g. "Textured French Crop"
  reasoning: string;               // Why it suits face shape and hair type
  addressesFrustrations: string;   // How it tackles their specific issues
  salonScript: string;             // Exact wording to use with their stylist
}

export interface Consultation {
  id: string;                      // uuid or Date.now() string
  userName: string;                // Snapshot of name at time of consultation
  createdAt: Date;
  input: HairAdvisorInput;         // Snapshot of input used
  recommendation: HairRecommendation;
  afterImageUrl?: string;          // Phase 2
}

export interface HairAdvisorResult {
  recommendation: HairRecommendation;
  afterImageUrl?: string;
}

// Phase 3
export interface StyleCatalogueEntry {
  id: string;
  label: string;
  tags: string[];
  localUri: string;
}
```

---

## Component Contracts

### ReferenceSection
```typescript
interface ReferenceSectionProps {
  photos: PhotoAsset[];
  maxPhotos: number;                      // 5
  onPhotosChange: (photos: PhotoAsset[]) => void;
  onBrowseStyles: () => void;
  stylePickerEnabled: boolean;            // false in Phase 1
}
```

### RecommendationDetail
Receives a parsed HairRecommendation — never a raw string. Renders reasoning, addressesFrustrations, and salonScript. Cut name is rendered by ResultsScreen above this component.

```typescript
interface RecommendationDetailProps {
  recommendation: HairRecommendation;
}
```

### ConsultationSummary
History list item.

```typescript
interface ConsultationSummaryProps {
  consultation: Consultation;
  onPress: () => void;
  onDelete: () => void;
}
```

### ResultCard
```typescript
interface ResultCardProps {
  afterImageUrl?: string;   // undefined in Phase 1 — renders placeholder
}
```

---

## AI Pipeline

### Phase 1 — Recommendation (Claude Vision)

Endpoint: POST https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
File: services/hairAdvisor.ts

**Request construction:**
- Convert all photos to base64 via expo-file-system
- Send current hair photos labelled as "Current hair photo [n]"
- Send reference photos (if any) labelled as "Reference/inspiration photo [n]" — source field ignored
- Append user notes as trailing text content
- Include userName in the user message for a personalised response tone

**System prompt:**
```
You are a professional hair consultant. Analyse the user's current hair from their photos,
consider any reference styles they have provided, and read their notes carefully.

Respond with a JSON object only. No preamble, no markdown, no explanation outside the JSON.

The JSON must match this exact structure:
{
  "cutName": "Name of the recommended cut",
  "reasoning": "Why this cut suits their face shape and hair type. 2-3 sentences.",
  "addressesFrustrations": "How this cut specifically addresses their frustrations and desires. 2-3 sentences.",
  "salonScript": "The exact words they should say to their stylist to ask for this cut. Be specific and practical."
}
```

**Response handling:**
- Strip any accidental markdown fences before parsing
- Parse response as HairRecommendation JSON
- Construct a Consultation record (add id, userName snapshot, createdAt, input snapshot)
- Call SessionContext.addConsultation()
- Navigate to ResultsScreen with the consultation and origin: 'fresh'
- If JSON parsing fails: surface a recoverable error state on ResultsScreen with a "Try again" option — do not crash

**API key note:** Read from ANTHROPIC_API_KEY environment variable. Comment in env.ts must note this requires a backend proxy before production — never ship API keys in an APK.

---

### Phase 2 — After Image (Replicate)

Not in Phase 1 scope. Build after recommendation flow is solid and tested.

**Model candidates (evaluate in order):**
1. InstantID — best for facial identity preservation
2. IP-Adapter + SDXL — good alternative if InstantID results are inconsistent

**Approach:**
- Use cutName + reasoning to construct the generation prompt
- Send one current hair photo as the base image
- Populate afterImageUrl on the Consultation record
- ResultCard renders the real image instead of the placeholder

**Note on expectations:** Results are illustrative, not photorealistic. Reflect this in UI copy near the image.

---

## Environment Variables

```typescript
// config/env.ts
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
export const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY ?? '';  // Phase 2

// PRODUCTION WARNING: These keys must not be shipped in the APK.
// Route all API calls through a backend proxy (Vercel / Railway) before release.
```

---

## Tamagui Setup Notes

Check these first if anything looks broken after scaffolding from Bolt:

**Babel config** — babel.config.js must include the Tamagui plugin:
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
        logTimings: true,
      },
    ],
  ],
};
```

**TamaguiProvider + SessionProvider** — wrap NavigationContainer in App.tsx:
```tsx
import { TamaguiProvider } from 'tamagui'
import config from './tamagui.config'

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <SessionProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
    </TamaguiProvider>
  )
}
```

**Version pinning** — lock all @tamagui/* packages to the same exact version. Mixed versions cause silent rendering failures.

**Metro config** — Tamagui may require metro.config.js changes for the compiler. Check Expo-specific Tamagui docs for the version in use.

**Do not mix primitives** — use XStack, YStack, Text, Button etc. throughout. Never mix with bare React Native View or Text.

---

## Roadmap

### Phase 1 — Core recommendation flow (current focus)
- Home screen with name input and History button
- Current hair photo input (1-3)
- Reference photo input via "Add your own" (up to 5)
- "Browse styles" present but disabled
- Notes input
- Claude vision API returning structured JSON
- Consultation record created and stored in SessionContext
- Results screen: after image placeholder, cut name, recommendation body, salon script card
- Trash icon to delete consultation
- Back to Input preserves state via SessionContext
- Resubmit pushes new Results screen
- Start Over resets input, popToTop
- History screen with session consultation list
- Tap history entry loads Results screen (origin: history)

### Phase 2 — Image generation
- Replicate API integration (InstantID / IP-Adapter)
- Real after image in ResultCard
- Backend proxy for API keys

### Phase 3 — Style picker
- StylePickerScreen as a modal
- Static style catalogue (JSON + bundled assets)
- Multi-select, mixes with user-supplied photos up to 5 cap
- "Browse styles" enabled — no other changes to Input or pipeline needed

### Phase 4 — Persistence & multi-user
- AsyncStorage or SQLite for consultation persistence across sessions
- Multiple named users / profiles
- Photo file management (base64 is not suitable for long-term storage)

### Phase 5 — Polish
- Onboarding
- Share results
- Export salon script

---

## Key Constraints & Decisions

- **SessionContext is the single source of truth** — user name, input state, and consultation history all live here. No local component state for anything that needs to survive navigation.
- **Consultation is a snapshot** — userName and input are captured at submission time. Changes to context after submission do not affect stored consultations.
- **Results origin param controls back behaviour** — 'fresh' pops to Input, 'history' pops to History. Always pass origin explicitly.
- **Trash deletes then pops** — always navigate away after deletion, never leave the user on a deleted result.
- **History is session-only for now** — no AsyncStorage, no persistence. Designed so Phase 4 persistence is additive.
- **Structured JSON output from Claude** — parse into HairRecommendation before passing anywhere. Never pass raw strings to UI components.
- **JSON parse failure is recoverable** — show error state with retry, do not crash.
- **Each submission pushes a new Results screen** — session history via the stack during a flow, full history via HistoryScreen.
- **ReferenceSection owns reference photo UX** — InputScreen never addresses PhotoPicker directly for references.
- **PhotoAsset.source is for UI only** — never branch on source in hairAdvisor.ts.
- **Tamagui for all UI** — do not mix with bare React Native primitives.
- **Tamagui Babel plugin required** — verify babel.config.js before any other work.
- **Pin Tamagui versions** — exact pins for all @tamagui/* packages.
- **Base64 all images before API call** — single async pass before navigating to Loading.
- **Reference photos always optional** — never assume they exist in API call logic.

---

## Development Sequence

1. Validate Bolt scaffold — screen flow, Tamagui rendering, photo picker on Android
2. Fix Tamagui config if broken (Babel plugin, Metro config, version pins)
3. Set up SessionContext — userName, input state, consultations list
4. Build HomeScreen — name input, Get Started, History button (disabled initially)
5. Implement hairAdvisor.ts — Claude API call, JSON parsing, Consultation construction
6. Build ResultsScreen — all sections, trash icon, origin-aware back behaviour
7. Wire Input -> Loading -> Results end-to-end with real API response
8. Build HistoryScreen — list, tap to load, per-entry delete
9. Verify full navigation flow: fresh result, back to Input, resubmit, history, delete
10. Build ReferenceSection with "Add your own" active, "Browse styles" disabled
11. Test end-to-end with real photos
12. Phase 2: Replicate image generation
13. Phase 3: StylePickerScreen and catalogue
14. Phase 4: Persistence and multi-user
