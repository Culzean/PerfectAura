import { Paths, File, Directory } from 'expo-file-system';
import { REPLICATE_API_KEY } from '../../config/env';
import { buildImagePrompt } from '../../config/prompts';
import type { HairRecommendation } from '../../types';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40; // ~60 seconds total

function getMediaType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function photoToDataUri(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();
  return `data:${getMediaType(uri)};base64,${base64}`;
}

async function pollPrediction(
  getUrl: string,
  signal?: AbortSignal
): Promise<string | null> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    if (signal?.aborted) return null;

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const response = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
      signal,
    });

    if (!response.ok) {
      console.warn(`[replicate] poll failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status === 'succeeded') {
      return typeof data.output === 'string' ? data.output : data.output?.[0] ?? null;
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      console.warn(`[replicate] prediction ${data.status}: ${data.error ?? 'unknown'}`);
      return null;
    }
  }

  console.warn('[replicate] polling timed out');
  return null;
}

async function downloadToLocal(cdnUrl: string, consultationId: string): Promise<string> {
  const dir = new Directory(Paths.document, 'after-images');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }

  const dest = new File(dir, `${consultationId}.jpg`);
  const downloaded = await File.downloadFileAsync(cdnUrl, dest, { idempotent: true });
  return downloaded.uri;
}

export async function generateAfterImage(
  photoUri: string,
  recommendation: HairRecommendation,
  signal?: AbortSignal,
  consultationId?: string
): Promise<string | null> {
  if (!REPLICATE_API_KEY) {
    console.warn('[replicate] no API key configured — skipping image generation');
    return null;
  }

  try {
    const inputImage = await photoToDataUri(photoUri);

    if (signal?.aborted) return null;

    const prompt = buildImagePrompt(recommendation.cutName, recommendation.salonScript);

    const response = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-dev/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt,
            input_image: inputImage,
            aspect_ratio: 'match_input_image',
            guidance: 3.0,
            output_format: 'jpg',
            go_fast: true,
          },
        }),
        signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[replicate] API error (${response.status}): ${errorBody}`);
      return null;
    }

    const data = await response.json();

    let cdnUrl: string | null = null;

    if (data.status === 'succeeded') {
      cdnUrl = typeof data.output === 'string' ? data.output : data.output?.[0] ?? null;
    } else if (data.status === 'processing' || data.status === 'starting') {
      cdnUrl = await pollPrediction(data.urls?.get, signal);
    } else {
      console.warn(`[replicate] unexpected status: ${data.status}`);
      return null;
    }

    if (!cdnUrl) return null;

    const fileId = consultationId ?? Date.now().toString();
    const localUri = await downloadToLocal(cdnUrl, fileId);
    return localUri;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    console.warn('[replicate] generation failed:', error);
    return null;
  }
}
