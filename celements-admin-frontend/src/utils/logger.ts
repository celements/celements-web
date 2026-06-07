import { type ConsolaInstance, createConsola } from 'consola/browser';

// https://github.com/unjs/consola?tab=readme-ov-file#log-level
const level = import.meta.env.VITE_ENABLE_LOCAL_DEVELOPMENT === 'true' ? 4 : 1;

const loggerFactory: (tagName: string) => ConsolaInstance = (tagName: string) =>
  createConsola({
    level,
    defaults: {
      tag: tagName,
    },
  });

export { loggerFactory as useLogger };
