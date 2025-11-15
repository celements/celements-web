import type { App } from 'vue';
import VueDomPurifyHtml from 'vue-dompurify-html';

export const createVueDompurify = {
  install: (app: App) => {
    app.use(VueDomPurifyHtml, {
      default: {
        // config for custom elements according to https://www.npmjs.com/package/dompurify
        ADD_TAGS: ['collection-viewer', 'event-viewer'],
        ADD_ATTR: [
          'template',
          'collection',
          'sort-fields',
          'params',
          'field',
          'src-fallback',
          'options',
          'non-zero',
          'extract',
          'version',
          'event-ref',
        ],
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: /^cel-/,
        },
      },
    });
  },
};
