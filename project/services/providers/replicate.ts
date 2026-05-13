import { Paths, File, Directory } from 'expo-file-system';
import { REPLICATE_API_KEY } from '../../config/env';
import { buildImagePrompt } from '../../config/prompts';
import type { HairRecommendation } from '../../types';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40; // ~60 seconds total
const FETCH_TIMEOUT_MS = 120_000; // 2 minutes for the initial request (Prefer: wait)

function detectMediaType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

async function photoToDataUri(uri: string, base64?: string): Promise<string> {
  let data: string;

  if (base64) {
    data = base64;
  } else {
    const file = new File(uri);
    data = await file.base64();
  }

  const mediaType = detectMediaType(data);
  return `data:${mediaType};base64,${data}`;
}

async function pollPrediction(
  getUrl: string,
  signal?: AbortSignal
): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    if (signal?.aborted) throw new Error('Aborted');

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const response = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Poll request failed (${response.status})`);
    }

    const data = await response.json();

    if (data.status === 'succeeded') {
      const url = typeof data.output === 'string' ? data.output : data.output?.[0];
      if (!url) throw new Error('Prediction succeeded but returned no output URL');
      return url;
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error ?? 'unknown reason'}`);
    }
  }

  throw new Error('Polling timed out after ~60 seconds');
}

async function downloadToLocal(cdnUrl: string, consultationId: string): Promise<string> {
  try {
    const dir = new Directory(Paths.document, 'after-images');
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }

    const dest = new File(dir, `${consultationId}.jpg`);
    const downloaded = await File.downloadFileAsync(cdnUrl, dest, { idempotent: true });
    return downloaded.uri;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to download image: ${msg}`);
  }
}

export async function generateAfterImage(
  photoUri: string,
  recommendation: HairRecommendation,
  signal?: AbortSignal,
  consultationId?: string,
  base64?: string
): Promise<string | null> {
  if (!REPLICATE_API_KEY) {
    throw new Error('Replicate API key not configured. Set EXPO_PUBLIC_REPLICATE_API_KEY in .env');
  }

  console.log('[replicate] building data URI from photo...');
  const inputImage = await photoToDataUri(photoUri, base64);
  console.log(`[replicate] data URI length: ${inputImage.length} chars`);

  if (signal?.aborted) return null;

  const prompt = buildImagePrompt(
    recommendation.cutName,
    recommendation.visualDescription || recommendation.salonScript,
    recommendation.hairColour || 'the same colour as in the photo'
  );
  console.log(`[replicate] prompt: ${prompt.substring(0, 120)}...`);
  console.log('[replicate] sending request...');

  // Abort on timeout or if the caller aborts
  const fetchController = new AbortController();
  const timeoutId = setTimeout(() => fetchController.abort(), FETCH_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => fetchController.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions',
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
            num_inference_steps: 35,
            guidance: 3.5,
            output_format: 'jpg',
          },
        }),
        signal: fetchController.signal,
      }
    );
  } catch (err) {
    clearTimeout(timeoutId);
    if (signal?.aborted) return null; // caller aborted — not an error
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Replicate API request timed out (2 min). The image may be too large.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  console.log(`[replicate] response status: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '(could not read body)');
    throw new Error(`Replicate API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  console.log(`[replicate] prediction status: ${data.status}`);
  console.log(`[replicate] output: ${JSON.stringify(data.output)?.substring(0, 200)}`);

  let cdnUrl: string;

  if (data.status === 'succeeded') {
    const url = typeof data.output === 'string' ? data.output : data.output?.[0];
    if (!url) throw new Error('Prediction succeeded but returned no output URL');
    cdnUrl = url;
  } else if (data.status === 'processing' || data.status === 'starting') {
    const pollUrl = data.urls?.get;
    if (!pollUrl) throw new Error('Prediction is processing but no poll URL was returned');
    console.log(`[replicate] polling at: ${pollUrl}`);
    cdnUrl = await pollPrediction(pollUrl, signal);
  } else {
    throw new Error(
      `Unexpected prediction status: ${data.status}. ${data.error ?? JSON.stringify(data).substring(0, 300)}`
    );
  }

  console.log(`[replicate] cdnUrl: ${cdnUrl.substring(0, 100)}`);

  console.log('[replicate] downloading to local...');
  const fileId = consultationId ?? Date.now().toString();
  const localUri = await downloadToLocal(cdnUrl, fileId);
  console.log(`[replicate] saved to: ${localUri}`);
  return localUri;
}
