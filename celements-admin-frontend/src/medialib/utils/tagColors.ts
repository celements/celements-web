// Deterministic color palette assigned by tag index.
// The backend has no color concept – we assign a stable color client-side.
const COLOR_PALETTE = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-slate-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-lime-500',
  'bg-indigo-500',
];

export function colorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * Converts a bare filename (as returned by /api/files/tags/files) to the
 * full VueFinder path used as keys in fileTagMap and for file selection.
 * e.g. "foo.jpg" → "local://foo.jpg"
 */
export function toVueFinderPath(filename: string): string {
  if (filename.includes('://')) return filename; // already a full path
  return `local://${filename}`;
}
