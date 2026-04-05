import { File } from 'expo-file-system';
import { ANTHROPIC_API_KEY } from '../config/env';
import { HAIR_ADVISOR_SYSTEM_PROMPT } from '../config/prompts';
import type { HairAdvisorInput, HairRecommendation, PhotoAsset } from '../types';

function getMediaType(uri: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

async function photoToBase64(photo: PhotoAsset): Promise<{ base64: string; mediaType: string }> {
  const file = new File(photo.uri);
  const base64 = await file.base64();
  return { base64, mediaType: getMediaType(photo.uri) };
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
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
  });

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

  const parsed = JSON.parse(cleaned);

  return {
    cutName: parsed.cutName,
    reasoning: parsed.reasoning,
    addressesFrustrations: parsed.addressesFrustrations,
    salonScript: parsed.salonScript,
  };
}
