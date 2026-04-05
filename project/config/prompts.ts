export const HAIR_ADVISOR_SYSTEM_PROMPT =
  'You are a professional hair consultant. Analyse the user\'s current hair from their photos, ' +
  'consider any reference styles they have provided, and read their notes carefully. ' +
  'Respond with a JSON object only. No preamble, no markdown, no explanation outside the JSON. ' +
  'Structure: { cutName, reasoning, addressesFrustrations, salonScript } \u2014 each a string.';

export function buildImagePrompt(cutName: string, salonScript: string): string {
  return [
    `Change the person's hairstyle to a ${cutName}.`,
    salonScript,
    'Maintain the exact same facial features, skin tone, face shape, expression, and background.',
    'The result should look like a natural photograph, not an illustration.',
    'Keep the same clothing and setting. Only change the hair.',
  ].join(' ');
}
