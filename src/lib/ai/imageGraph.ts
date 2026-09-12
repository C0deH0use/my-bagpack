/**
 * Graf LangGraph dla obrazków AI:
 *
 *   lookupCache ──(jest w pamięci?)──▶ END
 *       │
 *   writePrompt   (Gemini Flash pisze prompt po angielsku; gdy padnie —
 *       │          prompt zbudowany po prostu z nazwy rzeczy)
 *   renderImage   (Nano Banana rysuje; gdy padnie — END z opisem błędu)
 *       │
 *   shrinkImage   (canvas: bezpieczny kwadratowy PNG do ~192 px)
 *       │
 *      END
 *
 * Import z „@langchain/langgraph/web” — to browserowe wejście LangGraph.js
 * (bez node’owych zależności checkpointów).
 */

import { Annotation, END, START, StateGraph } from '@langchain/langgraph/web';
import { cacheImage, getCachedImage } from './imageCache';
import { generateImage, writeImagePrompt } from './gemini';

const PictureState = Annotation.Root({
  itemName: Annotation<string>,
  imagePrompt: Annotation<string>,
  imageDataUrl: Annotation<string>,
  failure: Annotation<string>,
});

type PictureStateType = typeof PictureState.State;

/** gdy Gemini-flash nie odpowie, prompt zrobimy sami — obrazek dalej ma prawo się udać */
const FALLBACK_PROMPT = (name: string) =>
  `Cute flat cartoon illustration of "${name}", soft pastel colors, thick friendly outlines, ` +
  'centered, plain white background, square composition, no text, no watermark.';

/** Zmniejsza obrazek do 192 px PNG — karteczki pokazują 80 px, więc starcza z zapasem. */
async function shrinkDataUrl(dataUrl: string, max = 192): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('nie udało się wczytać obrazka'));
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = max;
  canvas.height = max;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // bardzo stara przeglądarka — zostawiamy oryginał

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, max, max);
  const scale = Math.min(max / image.width, max / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (max - w) / 2, (max - h) / 2, w, h);
  return canvas.toDataURL('image/png');
}

const lookupCache = (state: PictureStateType): Partial<PictureStateType> => {
  const hit = getCachedImage(state.itemName);
  return hit ? { imageDataUrl: hit } : {};
};

const writePrompt = async (state: PictureStateType): Promise<Partial<PictureStateType>> => {
  try {
    return { imagePrompt: await writeImagePrompt(state.itemName) };
  } catch {
    return { imagePrompt: FALLBACK_PROMPT(state.itemName) };
  }
};

const renderImage = async (state: PictureStateType): Promise<Partial<PictureStateType>> => {
  try {
    return { imageDataUrl: await generateImage(state.imagePrompt) };
  } catch (e) {
    return { failure: e instanceof Error ? e.message : String(e) };
  }
};

const shrinkImage = async (state: PictureStateType): Promise<Partial<PictureStateType>> => {
  try {
    return { imageDataUrl: await shrinkDataUrl(state.imageDataUrl) };
  } catch {
    return {}; // nie umniejszymy — trudno, zostanie większy obrazek
  }
};

const afterCache = (state: PictureStateType): string => (state.imageDataUrl ? END : 'writePrompt');
const afterRender = (state: PictureStateType): string =>
  state.imageDataUrl ? 'shrinkImage' : END;

const graph = new StateGraph(PictureState)
  .addNode('lookupCache', lookupCache)
  .addNode('writePrompt', writePrompt)
  .addNode('renderImage', renderImage)
  .addNode('shrinkImage', shrinkImage)
  .addEdge(START, 'lookupCache')
  .addConditionalEdges('lookupCache', afterCache)
  .addEdge('writePrompt', 'renderImage')
  .addConditionalEdges('renderImage', afterRender)
  .addEdge('shrinkImage', END)
  .compile();

export interface ItemPictureResult {
  /** data URL obrazka; '' gdy się nie udało */
  image: string;
  prompt: string;
  failure: string;
}

/** Tworzy obrazek AI dla nazwy rzeczy (z cache, o ile już jest). */
export async function generateItemPicture(itemName: string): Promise<ItemPictureResult> {
  const result = await graph.invoke({
    itemName: itemName.trim(),
    imagePrompt: '',
    imageDataUrl: '',
    failure: '',
  });

  if (result.imageDataUrl) cacheImage(itemName, result.imageDataUrl);
  return { image: result.imageDataUrl, prompt: result.imagePrompt, failure: result.failure };
}
