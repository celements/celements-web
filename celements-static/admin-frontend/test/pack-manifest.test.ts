import { readFileSync } from 'node:fs';

import { expect, test } from 'vitest';

const manifestPath = process.env.CELEMENTS_PACK_MANIFEST;

test.skipIf(!manifestPath)('pack manifest contains only published artifacts', () => {
  if (!manifestPath)
    throw new Error('CELEMENTS_PACK_MANIFEST must point to an npm pack JSON file.');
  const packed = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<
    string,
    { files: { path: string }[] }
  >;
  const files = Object.values(packed).flatMap(({ files }) => files.map(({ path }) => path));
  expect(files.some((file) => file.startsWith('dist/package/'))).toBe(true);
  expect(files.some((file) => file.startsWith('dist/types/'))).toBe(true);
  expect(files.some((file) => file.startsWith('dist/assets/'))).toBe(false);
  expect(files.some((file) => file.startsWith('dist/.vite/'))).toBe(false);
});
