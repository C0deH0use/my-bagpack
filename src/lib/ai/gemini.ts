/**
 * Minimalny klient Gemini API (REST) uwierzytelniany tokenem OAuth z Google.
 *
 * Celowo bez SDK: @google/genai w przeglądarce wymaga klucza API, a my
 * właśnie nie chcemy trzymać żadnych kluczy w przeglądarce — z tokenem
 * OAuth zamiast klucza najprościej wychodzi zwykły fetch.
 */

import { GEMINI_IMAGE_MODEL, GEMINI_TEXT_MODEL, readAiConfig } from './config';
import { getAccessToken, signInWithGoogle } from './googleOAuth';

const API = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

/** fetch z tokenem; przy 401 raz pobiera nowy token i próbuje ponownie */
async function geminiFetch(path: string, body: unknown): Promise<GeminiResponse> {
  const { projectId } = readAiConfig();

  const doFetch = (token: string) =>
    fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(projectId ? { 'x-goog-user-project': projectId } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

  let res = await doFetch(await getAccessToken());
  if (res.status === 401) {
    // token wygasł szybciej niż our zegarek — bierzemy nowy i raz jeszcze
    res = await doFetch(await signInWithGoogle());
  }

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) throw new Error(data.error?.message ?? `Gemini odpowiedział: ${res.status}`);
  return data;
}

function firstText(response: GeminiResponse): string {
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.text) return part.text.trim();
  }
  return '';
}

function firstImageDataUrl(response: GeminiResponse): string {
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  return '';
}

/** Z nazwy rzeczy robi krótki, konkretny prompt obrazka (po angielsku, spójny styl). */
export async function writeImagePrompt(itemName: string): Promise<string> {
  const response = await geminiFetch(`/models/${GEMINI_TEXT_MODEL}:generateContent`, {
    contents: [
      {
        parts: [
          {
            text: [
              'You write prompts for an image generator in a kids packing-list app.',
              'Given an item name (often in Polish), reply with ONE short English prompt (max 40 words).',
              'Style, always the same: cute flat cartoon illustration of the single item,',
              'soft pastel colors, thick friendly outlines, centered, plain white background,',
              'square composition, no text, no watermark, no extra objects.',
              `Item name: "${itemName}".`,
              'Reply with the prompt only.',
            ].join(' '),
          },
        ],
      },
    ],
  });

  const prompt = firstText(response);
  if (!prompt) throw new Error('Gemini nie odpowiedział na zapytanie o prompt');
  return prompt;
}

/** Renderuje obrazek (Nano Banana) i zwraca go jako data URL. */
export async function generateImage(prompt: string): Promise<string> {
  const response = await geminiFetch(`/models/${GEMINI_IMAGE_MODEL}:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });

  const dataUrl = firstImageDataUrl(response);
  if (!dataUrl) throw new Error('Gemini nie zwrócił obrazka');
  return dataUrl;
}
