import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createI18n } from 'vue-i18n';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ navigateTo: vi.fn() }));
vi.mock('@/utils/navigation', () => navigation);

const attachment = {
  dir: 'attachments://Space/Page',
  basename: 'image.jpg',
  extension: 'jpg',
  path: 'attachments://Space/Page/image.jpg',
  historyUrl: '/xwiki/bin/viewattachrev/Space/Page/image.jpg',
  storage: 'attachments',
  type: 'file' as const,
  file_size: 123,
  last_modified: 1,
  mime_type: 'image/jpeg',
  visibility: 'public',
};
type TestAttachment = Omit<typeof attachment, 'type'> & { type: 'file' | 'dir' };
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: { common: { pageAttachments: { revisionHistory: 'Revision history' } } } },
});

const finderCapabilities = (element: ParentNode) => {
  const features = JSON.parse(
    element.querySelector('[data-finder-id]')?.getAttribute('data-features') ?? '{}'
  ) as Record<string, boolean>;
  return { upload: features.upload, delete: features.delete };
};

vi.mock('vuefinder', () => {
  class RemoteDriver {
    baseURL: string;
    constructor({ baseURL }: { baseURL: string }) {
      this.baseURL = baseURL;
    }
    getDownloadUrl(file: { path: string }) {
      return file.path;
    }
  }
  const VueFinder = defineComponent({
    name: 'VueFinder',
    props: {
      id: { type: String, required: true },
      driver: { type: Object, required: true },
      contextMenuItems: { type: Array, default: () => [] },
      features: { type: Object, default: () => ({}) },
    },
    emits: ['select'],
    setup(props, { emit, slots }) {
      return () =>
        h(
          'div',
          {
            'data-finder-id': props.id,
            'data-driver': props.driver.baseURL,
            'data-features': JSON.stringify(props.features),
          },
          [
            h('button', { class: 'select', onClick: () => emit('select', [attachment]) }, 'select'),
            slots['status-bar']?.({
              path: 'attachments://Space/Page',
              count: 1,
              selected: [attachment],
            }),
          ]
        );
    },
  });
  return {
    default: { install: vi.fn() },
    RemoteDriver,
    VueFinder,
  };
});

import routes from '@/conf/routes';
import PageAttachments from '@/features/page-attachments/PageAttachments.vue';
import {
  CelPageAttachmentsElement,
  PAGE_ATTACHMENTS_ELEMENT_NAME,
  registerPageAttachmentsElement,
} from '@/islands/page-attachments-element';
import { createCelementsApplication } from '@/runtime/application';
import { ensureCelementsAdminStyles } from '@/runtime/styles';

beforeAll(() => registerPageAttachmentsElement());

afterEach(() => {
  document.body.replaceChildren();
});

describe('PageAttachments feature', () => {
  test('mounts without Vue Router and keeps the attachment REST contract', () => {
    const wrapper = mount(PageAttachments, {
      props: { spaceName: 'My Space', docName: 'Page', canUpload: false, canDelete: false },
      global: { plugins: [i18n] },
    });
    expect(wrapper.find('[data-driver]').attributes('data-driver')).toBe(
      '/api/attachments/My%20Space/Page'
    );
    expect(finderCapabilities(wrapper.element)).toEqual({ upload: false, delete: false });
  });

  test('exposes selection and a typed attachment action slot', async () => {
    const wrapper = mount(PageAttachments, {
      props: { spaceName: 'Space', docName: 'Page', canUpload: true, canDelete: false },
      global: { plugins: [i18n] },
      slots: {
        'attachment-actions': ({ document, path, count, selectedAttachments }) =>
          h(
            'button',
            { class: 'downstream-action' },
            `${document.spaceName}.${document.docName}:${path}:${count}:${selectedAttachments[0].basename}`
          ),
      },
    });
    expect(wrapper.get('.downstream-action').text()).toBe(
      'Space.Page:attachments://Space/Page:1:image.jpg'
    );
    await wrapper.get('.select').trigger('click');
    expect(wrapper.emitted('selectionChange')?.[0]?.[0]).toEqual({
      document: { spaceName: 'Space', docName: 'Page' },
      selectedAttachments: [attachment],
    });
    expect(finderCapabilities(wrapper.element)).toEqual({ upload: true, delete: false });
  });

  test('keeps delete enabled when upload is disabled', () => {
    const wrapper = mount(PageAttachments, {
      props: { spaceName: 'Space', docName: 'Page', canUpload: false, canDelete: true },
      global: { plugins: [i18n] },
    });
    expect(finderCapabilities(wrapper.element)).toEqual({ upload: false, delete: true });
  });
});

test('history menu is localized, selective, and navigates to the supplied URL', () => {
  const wrapper = mount(PageAttachments, {
    props: { spaceName: 'Space', docName: 'Page', canUpload: false, canDelete: true },
    global: { plugins: [i18n] },
  });
  const [item] = wrapper.findComponent({ name: 'VueFinder' }).props('contextMenuItems') as Array<{
    title: () => string;
    show: (app: unknown, context: { items: TestAttachment[]; target: TestAttachment }) => boolean;
    action: (app: unknown, items: TestAttachment[]) => void;
  }>;
  expect(item.title()).toBe('Revision history');
  expect(item.show({}, { items: [attachment], target: attachment })).toBe(true);
  expect(
    item.show(
      {},
      { items: [{ ...attachment, historyUrl: '' }], target: { ...attachment, historyUrl: '' } }
    )
  ).toBe(false);
  expect(
    item.show(
      {},
      { items: [{ ...attachment, type: 'dir' }], target: { ...attachment, type: 'dir' } }
    )
  ).toBe(false);
  expect(item.show({}, { items: [attachment, attachment], target: attachment })).toBe(false);
  item.action({}, [attachment]);
  expect(navigation.navigateTo).toHaveBeenCalledWith(
    '/xwiki/bin/viewattachrev/Space/Page/image.jpg'
  );
});

test('the SPA route converts route params to feature props', () => {
  const route = routes.find(({ name }) => name === 'PageAttachments');
  expect(typeof route?.props).toBe('function');
  expect(
    (route?.props as (route: { params: Record<string, string> }) => unknown)({
      params: { spaceName: 'Space', docName: 'Page' },
    })
  ).toEqual({ spaceName: 'Space', docName: 'Page' });
});

describe('cel-page-attachments island', () => {
  test('maps literal capability attributes into rendered features and forwards selection', async () => {
    const element = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    element.spaceName = 'Space';
    element.docName = 'Page';
    element.locale = 'de';
    element.localDev = false;
    element.setAttribute('can-upload', 'false');
    element.setAttribute('can-delete', 'true');
    const listener = vi.fn();
    element.addEventListener('attachment-selection-change', listener);
    document.body.append(element);
    expect(element.getAttribute('space-name')).toBe('Space');
    expect(element.getAttribute('doc-name')).toBe('Page');
    expect(element.locale).toBe('de');
    expect(element.canUpload).toBe(false);
    expect(element.canDelete).toBe(true);
    expect(finderCapabilities(element)).toEqual({ upload: false, delete: true });
    await element.querySelector<HTMLButtonElement>('.select')?.click();
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail.selectedAttachments).toEqual([
      attachment,
    ]);
  });

  test('unmounts, reconnects, and supports isolated simultaneous applications', () => {
    const first = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    first.spaceName = 'Space';
    first.docName = 'One';
    const second = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    second.spaceName = 'Space';
    second.docName = 'Two';
    document.body.append(first, second);
    const ids = [first, second].map(
      (element) => element.querySelector<HTMLElement>('[data-finder-id]')?.dataset.finderId
    );
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
    first.remove();
    expect(first.childElementCount).toBe(0);
    document.body.append(first);
    expect(first.querySelector('[data-finder-id]')).not.toBeNull();
    const firstApp = createCelementsApplication({ render: () => h('div') });
    const secondApp = createCelementsApplication({ render: () => h('div') });
    expect(firstApp.pinia).not.toBe(secondApp.pinia);
  });

  test('remounts with updated document attributes', () => {
    const element = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    element.spaceName = 'Space';
    element.docName = 'One';
    document.body.append(element);
    const firstFinderId = element.querySelector<HTMLElement>('[data-finder-id]')?.dataset.finderId;
    element.docName = 'Two';
    expect(element.querySelector('[data-driver]')?.getAttribute('data-driver')).toBe(
      '/api/attachments/Space/Two'
    );
    expect(element.querySelector<HTMLElement>('[data-finder-id]')?.dataset.finderId).not.toBe(
      firstFinderId
    );
  });

  test('remounts when capabilities change and preserves explicit false', () => {
    const element = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    element.spaceName = 'Space';
    element.docName = 'Page';
    element.setAttribute('can-upload', 'false');
    element.setAttribute('can-delete', 'true');
    document.body.append(element);
    const firstFinderId = element.querySelector('[data-finder-id]')?.getAttribute('data-finder-id');
    element.setAttribute('can-upload', 'true');
    element.setAttribute('can-delete', 'false');
    expect(element.querySelector('[data-finder-id]')?.getAttribute('data-finder-id')).not.toBe(
      firstFinderId
    );
    expect(finderCapabilities(element)).toEqual({ upload: true, delete: false });
  });
});

test('registration, build entries, and CSS containment are explicit', () => {
  registerPageAttachmentsElement();
  expect(customElements.get(PAGE_ATTACHMENTS_ELEMENT_NAME)).toBe(CelPageAttachmentsElement);
  const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');
  expect(viteConfig).toContain("runtime: 'src/public/runtime.ts'");
  expect(viteConfig).toContain("'page-attachments': 'src/public/page-attachments.ts'");
  expect(viteConfig).toContain(
    "'page-attachments-island': 'src/public/page-attachments-island.ts'"
  );
  const css = readFileSync(resolve(process.cwd(), 'src/assets/main.css'), 'utf8');
  expect(css).not.toMatch(/(^|\n):root/);
  expect(css).toContain("@import 'tailwindcss/theme.css' layer(theme) prefix(tw);");
  expect(css).toContain(
    "@import 'tailwindcss/utilities.css' layer(utilities) prefix(tw) important source(none);"
  );
  expect(css).toContain("@source '..';");
  expect(css).toContain("@source '../../index.html';");
  expect(css).toContain("@config '../../tailwind.config.js';");
  expect(css).toContain('.cel-admin-surface h1');
  const islandTemplate = readFileSync(
    resolve(
      process.cwd(),
      '../celements-webapp/src/main/webapp/templates/celTemplates/pageAttachmentsIsland.vm'
    ),
    'utf8'
  );
  expect(islandTemplate).toContain('cel-page-attachments { display: block; width: 100%; }');
  expect(css).not.toContain('cel-page-attachments');
  ensureCelementsAdminStyles('https://static.example/assets/', true);
  ensureCelementsAdminStyles('https://static.example/assets/', true);
  expect(document.head.querySelectorAll('#celements-admin-vendor-styles')).toHaveLength(1);
  expect(document.head.querySelectorAll('#celements-admin-application-styles')).toHaveLength(1);
});

test('PageAttachments and the island runtime remain router-independent', () => {
  const feature = readFileSync(
    resolve(process.cwd(), 'src/features/page-attachments/PageAttachments.vue'),
    'utf8'
  );
  const island = readFileSync(
    resolve(process.cwd(), 'src/islands/page-attachments-element.ts'),
    'utf8'
  );
  const runtime = readFileSync(resolve(process.cwd(), 'src/runtime/application.ts'), 'utf8');
  expect(feature).not.toContain('vue-router');
  expect(feature).not.toContain('useRoute');
  expect(island).not.toContain('vue-router');
  expect(runtime).not.toContain('vue-router');
});
