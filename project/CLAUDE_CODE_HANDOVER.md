# HairAdvisor — Claude Code Handover Prompt

Paste this prompt to Claude Code at the start of your session, from the project root directory.

---

## PROMPT

I have a React Native (Expo) app called HairAdvisor that was scaffolded by Bolt.new. The project plan is in CLAUDE.md — read that first before doing anything else.

The scaffold is in good shape but needs specific fixes and missing pieces built. Work through the tasks below in order. Do not proceed to the next task until the current one compiles without errors.

---

### CONTEXT: What Bolt got right — do not touch these

- `app/_layout.tsx` and `app/index.tsx` — Expo Router / React Navigation bridge using NavigationIndependentTree. Leave exactly as-is.
- `navigation/AppNavigator.tsx` — all 5 screens registered correctly with correct options
- `context/SessionContext.tsx` — matches spec, well implemented
- `screens/HomeScreen.tsx` — complete, do not modify
- `screens/ResultsScreen.tsx` — complete except for one bug (see Task 1)
- `services/hairAdvisor.ts` — mostly correct, one fix needed (see Task 2)
- `tamagui.config.ts` — leave as-is
- `babel.config.js` — the @tamagui/babel-plugin is intentionally commented out due to a React 19 / Tamagui compatibility issue. Do not uncomment it. Tamagui runtime mode is acceptable for this phase.

---

### TASK 1 — Fix ResultsScreen.tsx: handleBack origin logic

The handleBack function has identical branches — origin logic is not applied:

```typescript
// BROKEN — both branches do the same thing
const handleBack = () => {
  if (origin === 'fresh') {
    navigation.goBack();
  } else {
    navigation.goBack();
  }
};
```

Fix to match the delete logic already in the same file:
- origin 'fresh' — navigate to 'Input'
- origin 'history' — navigate to 'History'

---

### TASK 2 — Fix hairAdvisor.ts: dynamic media_type detection

The media_type is hardcoded as 'image/jpeg'. Photos from the gallery may be PNG or HEIC. Fix photoToBase64 (or the content block construction) to detect the format from the URI file extension and set media_type accordingly. Supported values: 'image/jpeg', 'image/png', 'image/webp'. Default to 'image/jpeg' if extension is unrecognised or absent.

---

### TASK 3 — Fix types/index.ts: complete PhotoAsset type

The current PhotoAsset is missing fields required by the plan. Replace it with:

```typescript
export type PhotoSource = 'gallery' | 'camera' | 'style-picker';

export interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
  base64?: string;       // Populated before API call
  source: PhotoSource;   // For UI display only — never branch on this in hairAdvisor.ts
  styleId?: string;      // Phase 3 only — catalogue entry reference
}
```

Also add the StyleCatalogueEntry type at the bottom of the file, clearly marked as Phase 3:

```typescript
// Phase 3
export interface StyleCatalogueEntry {
  id: string;
  label: string;
  tags: string[];
  localUri: string;
}
```

After updating types, fix any TypeScript errors that result — particularly in SessionContext and hairAdvisor.ts where PhotoAsset is constructed. When constructing PhotoAsset from expo-image-picker results, set source to 'gallery' or 'camera' as appropriate.

---

### TASK 4 — Build InputScreen.tsx

The current InputScreen is likely a stub. Build it to spec:

Three sections in a ScrollView:

**Section 1 — Current Hair Photos** (required, 1–3)
- Label: "YOUR HAIR" 
- Uses PhotoPicker component (build this first — see Task 6)
- PhotoGrid showing selected photos
- Required — used to disable the submit button

**Section 2 — Reference Photos** (optional, up to 5 total)
- Label: "INSPIRATION" with "Optional" badge
- Uses ReferenceSection component (see Task 7)
- Two buttons always visible:
  - "Browse styles" — disabled, shows "Coming soon" label
  - "Add your own" — active, opens image picker

**Section 3 — Notes** (optional)
- Label: "NOTES"
- Multi-line Input from Tamagui
- Placeholder: "Describe your hair type, what you like, what frustrates you about your current cut, and any styles you're drawn to."
- Minimum height 100

**Submit flow:**
- "Get Recommendation" button — disabled until currentPhotos.length >= 1
- On press:
  1. Convert all photos to base64 using expo-file-system (photoToBase64 in hairAdvisor.ts)
  2. Navigate to Loading screen
  3. Call getHairRecommendation from hairAdvisor.ts
  4. Construct Consultation record: { id: Date.now().toString(), userName: sessionContext.userName, createdAt: new Date(), input: snapshot of current input, recommendation: result }
  5. Call addConsultation()
  6. Navigate to Results with { consultation, origin: 'fresh' }
  7. On error: navigate back from Loading, show an Alert with the error message and a retry option

All form state reads from and writes to SessionContext — not local component state. This ensures state survives back-pops from Results.

---

### TASK 5 — Build LoadingScreen.tsx

Simple screen:
- No back navigation (gestureEnabled: false already set in AppNavigator)
- Centered layout
- Animated pulsing or spinning indicator — use Tamagui's Spinner or an Animated value
- Text: "Analysing your hair..."
- Subtext: "This may take a few seconds"
- Do not add any navigation logic — this screen is navigated away from by InputScreen once the API call resolves

---

### TASK 6 — Build components/PhotoPicker.tsx

```typescript
interface PhotoPickerProps {
  photos: PhotoAsset[];
  maxPhotos: number;
  label: string;
  optional?: boolean;
  onPhotosChange: (photos: PhotoAsset[]) => void;
}
```

Behaviour:
- Shows PhotoGrid of current selections
- "Add photo" button — launches expo-image-picker with allowsMultipleSelection up to remaining cap (maxPhotos minus current count). Request both camera and media library permissions. Allow both gallery and camera via ImagePicker.MediaTypeOptions.Images.
- Set source to 'gallery' on picker result (camera support can be added later)
- Individual photo removal via a small X button overlay on each photo in the grid
- Button disabled when at cap

---

### TASK 7 — Build components/ReferenceSection.tsx

```typescript
interface ReferenceSectionProps {
  photos: PhotoAsset[];
  maxPhotos: number;          // 5
  onPhotosChange: (photos: PhotoAsset[]) => void;
  onBrowseStyles: () => void;
  stylePickerEnabled: boolean; // false in Phase 1
}
```

Renders:
- PhotoGrid of current reference selections with X removal per photo
- Two buttons in an XStack:
  - "Browse styles": disabled, opacity 0.4, small "Coming soon" Text beneath it. Calls onBrowseStyles when stylePickerEnabled is true.
  - "Add your own": active, launches expo-image-picker. Same logic as PhotoPicker but sets source to 'gallery'. Cap is maxPhotos minus photos.length.

---

### TASK 8 — Build components/PhotoGrid.tsx

```typescript
interface PhotoGridProps {
  photos: PhotoAsset[];
  onRemove?: (index: number) => void; // If provided, shows X button on each photo
  size?: number;                       // Default 80
}
```

Renders photos in a horizontal ScrollView. Each photo is a square with borderRadius. If onRemove is provided, shows a small circular X button in the top-right corner of each photo. Use the uri field for the Image source.

---

### TASK 9 — Build HistoryScreen.tsx

- ScrollView list of consultations from SessionContext
- Each entry uses ConsultationSummary component (see Task 10)
- Empty state: centred text "No consultations yet" with a subtext "Your recommendations will appear here"
- Tap entry: navigate to Results with { consultation: entry, origin: 'history' }
- Header: "History" title, back button returns to Home
- Consultations shown newest first (addConsultation prepends, so order is already correct)

---

### TASK 10 — Build components/ConsultationSummary.tsx

```typescript
interface ConsultationSummaryProps {
  consultation: Consultation;
  onPress: () => void;
  onDelete: () => void;
}
```

Renders a card with:
- User name (bold)
- Date and time of consultation — format as "DD MMM YYYY, HH:MM" e.g. "24 Mar 2026, 14:32"
- Recommended cut name
- Trash icon on the right — calls onDelete
- Entire card (except trash) is pressable — calls onPress
- Use Tamagui primitives throughout

---

### FINAL CHECK

Once all tasks are complete, verify:
1. No TypeScript errors across the project
2. Full navigation flow works: Home -> Input -> Loading -> Results, back to Input, resubmit pushes new Results, Start Over returns to Home
3. History screen shows entries, tap loads Results with correct origin, trash deletes
4. All Tamagui — no bare React Native View or Text anywhere in new code

Do not implement Phase 2 (Replicate image generation) or Phase 3 (StylePickerScreen) — those are future phases documented in CLAUDE.md.
