import type { HairRecommendation } from '../types';

export interface ImageGenerationProvider {
  generateAfterImage(
    photoUri: string,
    recommendation: HairRecommendation,
    signal?: AbortSignal
  ): Promise<string | null>;
}

// Active provider — change this one import to swap providers
export { generateAfterImage } from './providers/replicate';
