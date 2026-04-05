export type PhotoSource = 'gallery' | 'camera' | 'style-picker';
export type ImageGenStatus = 'idle' | 'generating' | 'succeeded' | 'failed';

export interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
  base64?: string;       // Populated before API call
  source: PhotoSource;   // For UI display only — never branch on this in hairAdvisor.ts
  styleId?: string;      // Phase 3 only — catalogue entry reference
}

export interface HairAdvisorInput {
  currentPhotos: PhotoAsset[];
  referencePhotos: PhotoAsset[];
  notes: string;
}

export interface HairRecommendation {
  cutName: string;
  reasoning: string;
  addressesFrustrations: string;
  salonScript: string;
}

export interface Consultation {
  id: string;
  userName: string;
  createdAt: Date;
  input: HairAdvisorInput;
  recommendation: HairRecommendation;
  afterImageUrl?: string;
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
