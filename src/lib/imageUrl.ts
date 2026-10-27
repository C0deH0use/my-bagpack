/**
 * Konwertuje ścieżkę do pliku graficznego (np. '/items/termos.jpg') na właściwy URL,
 * uwzględniając podścieżkę wdrożenia (np. base '/my-bagpack/' na GitHub Pages).
 */
export function getItemImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}
