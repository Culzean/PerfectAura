// WARNING: In production, the API key must be proxied through a backend server.
// Never expose the Anthropic API key directly in a client-side application.
export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
