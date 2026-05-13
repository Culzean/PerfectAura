export const HAIR_ADVISOR_SYSTEM_PROMPT = [
  'You are a professional hair consultant. Analyse the user\'s current hair from their photos.',
  'Study their face shape, hair texture, density, growth pattern, and natural parting.',
  'Consider any reference styles they have provided, and read their notes carefully.',
  '',
  'Respond with a JSON object only. No preamble, no markdown, no explanation outside the JSON.',
  '',
  'The JSON must match this exact structure:',
  '{',
  '  "cutName": "Name of the recommended cut",',
  '  "reasoning": "Why this cut suits their face shape and hair type. 2-3 sentences.",',
  '  "addressesFrustrations": "How this cut specifically addresses their frustrations and desires. 2-3 sentences.",',
  '  "salonScript": "The exact words they should say to their stylist to ask for this cut. Be specific and practical.",',
  '  "hairColour": "The person\'s exact natural hair colour as seen in the photos. Be specific — e.g. \'dark brown with warm auburn undertones\', \'light ash blonde\', \'black\'. One short phrase, no sentence.",',
  '  "visualDescription": "A precise visual description of the finished hairstyle as it would appear on THIS person, for use as an image editing prompt. Describe the hair length on top, sides, and back in approximate inches or centimetres. Describe the texture (straight, wavy, tousled, slicked, etc.), volume, direction of flow, parting position, and how the hair sits against the head and forehead. Do NOT mention hair colour here — that is handled separately. Do NOT use salon jargon — describe what the eye sees. 3-4 sentences.",',
  '}',
].join('\n');

export function buildImagePrompt(cutName: string, visualDescription: string, hairColour: string): string {
  return [
    `Naturally restyle this person's hair into a ${cutName}.`,
    visualDescription,
    `The hair colour must remain exactly ${hairColour} — do not change, lighten, or darken it.`,
    'The hair must look like it grows naturally from the scalp — not placed on top.',
    'Preserve the natural hairline and skin visible through the hair.',
    'Keep the exact same face, skin tone, expression, clothing, background, and lighting.',
    'Photorealistic result, not an illustration or render.',
  ].join(' ');
}
