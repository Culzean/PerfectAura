import { File } from 'expo-file-system';
import { ANTHROPIC_API_KEY } from '../config/env';
import { HAIR_ADVISOR_SYSTEM_PROMPT } from '../config/prompts';
import type { HairAdvisorInput, HairRecommendation, PhotoAsset } from '../types';

const REQUEST_TIMEOUT_MS = 60_000;

function detectMediaType(base64: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

async function photoToBase64(photo: PhotoAsset): Promise<{ base64: string; mediaType: string }> {
  let base64: string;

  if (photo.base64) {
    base64 = photo.base64;
  } else {
    const file = new File(photo.uri);
    base64 = await file.base64();
  }

  return { base64, mediaType: detectMediaType(base64) };
}

export async function getHairRecommendation(
  input: HairAdvisorInput,
  userName: string
): Promise<HairRecommendation> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const contentBlocks: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  > = [];

  for (let i = 0; i < input.currentPhotos.length; i++) {
    const { base64, mediaType } = await photoToBase64(input.currentPhotos[i]);
    contentBlocks.push({
      type: 'text',
      text: `Current hair photo ${i + 1}:`,
    });
    contentBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
    });
  }

  for (let i = 0; i < input.referencePhotos.length; i++) {
    const { base64, mediaType } = await photoToBase64(input.referencePhotos[i]);
    contentBlocks.push({
      type: 'text',
      text: `Reference/inspiration photo ${i + 1}:`,
    });
    contentBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
    });
  }

  if (input.notes.trim()) {
    contentBlocks.push({
      type: 'text',
      text: `Notes from ${userName}: ${input.notes}`,
    });
  } else {
    contentBlocks.push({
      type: 'text',
      text: `The user's name is ${userName}. Please analyse their hair and provide a recommendation.`,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: HAIR_ADVISOR_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: contentBlocks }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText: string = data.content[0].text;

  const cleaned = rawText
    .replace(/```(?:json)?\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      'The AI returned an unexpected response format. Please try again.'
    );
  }

  return {
    cutName: String(parsed.cutName ?? ''),
    reasoning: String(parsed.reasoning ?? ''),
    addressesFrustrations: String(parsed.addressesFrustrations ?? ''),
    salonScript: String(parsed.salonScript ?? ''),
    hairColour: String(parsed.hairColour ?? ''),
    visualDescription: String(parsed.visualDescription ?? ''),
  };
}
