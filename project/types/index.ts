export interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
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
