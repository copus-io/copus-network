/**
 * Decode HTML entities in a string (e.g. &amp; → &, &#235; → ë, &lt; → <).
 * Uses the browser's native HTML parser for correctness.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}
