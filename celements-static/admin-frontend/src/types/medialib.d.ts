/**
 * A file label/tag as used throughout the MediaLib UI.
 */
export interface Tag {
  id: string;
  label: string;
  color: string; // tailwind bg-color class, e.g. 'bg-teal-500'
}

/**
 * Raw shape returned by GET /api/files/tags.
 */
export interface TagDto {
  id: string;
  prettyName: string;
  prettyNames: Record<string, string>;
}
