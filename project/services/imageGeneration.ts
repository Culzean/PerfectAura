import type { HairRecommendation } from '../types';

export interface ImageGenerationProvider {
  generateAfterImage(
    photoUri: string,
    recommendation: HairRecommendation,
    signal?: AbortSignal,
    consultationId?: string,
    base64?: string
  ): Promise<string | null>;
}

// Active provider — change this one import to swap providers
export { generateAfterImage } from './providers/replicate';
