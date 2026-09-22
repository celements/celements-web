// Deterministic color palette assigned by tag index.
// The backend has no color concept – we assign a stable color client-side.
const COLOR_PALETTE = [
  'tw:bg-teal-500',
  'tw:bg-blue-500',
  'tw:bg-amber-500',
  'tw:bg-violet-500',
  'tw:bg-slate-500',
  'tw:bg-rose-500',
  'tw:bg-emerald-500',
  'tw:bg-cyan-500',
  'tw:bg-orange-500',
  'tw:bg-pink-500',
  'tw:bg-lime-500',
  'tw:bg-indigo-500',
];

export const colorForIndex = (index: number): string => {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

/**
 * Converts a bare filename (as returned by /api/files/tags/files) to the
 * full VueFinder path used as keys in fileTagMap and for file selection.
 * e.g. "foo.jpg" → "local://foo.jpg"
 */
export const toVueFinderPath = (filename: string): string => {
  if (filename.includes('://')) return filename; // already a full path
  return `local://${filename}`;
};
