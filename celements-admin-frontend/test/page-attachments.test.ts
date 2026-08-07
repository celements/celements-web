import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

const attachment = {
  dir: 'attachments://Space/Page',
  basename: 'image.jpg',
  extension: 'jpg',
  path: 'attachments://Space/Page/image.jpg',
  storage: 'attachments',
  type: 'file' as const,
  file_size: 123,
  last_modified: 1,
  mime_type: 'image/jpeg',
  visibility: 'public',
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
    },
    emits: ['select'],
    setup(props, { emit, slots }) {
      return () =>
        h('div', { 'data-finder-id': props.id, 'data-driver': props.driver.baseURL }, [
          h('button', { class: 'select', onClick: () => emit('select', [attachment]) }, 'select'),
          slots['status-bar']?.({
            path: 'attachments://Space/Page',
            count: 1,
            selected: [attachment],
          }),
        ]);
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
      props: { spaceName: 'My Space', docName: 'Page' },
    });
    expect(wrapper.find('[data-driver]').attributes('data-driver')).toBe(
      '/api/attachments/My%20Space/Page'
    );
  });

  test('exposes selection and a typed attachment action slot', async () => {
    const wrapper = mount(PageAttachments, {
      props: { spaceName: 'Space', docName: 'Page' },
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
  });
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
  test('maps attributes and properties and forwards selection as a DOM event', async () => {
    const element = document.createElement(
      PAGE_ATTACHMENTS_ELEMENT_NAME
    ) as CelPageAttachmentsElement;
    element.spaceName = 'Space';
    element.docName = 'Page';
    element.locale = 'de';
    element.localDev = false;
    const listener = vi.fn();
    element.addEventListener('attachment-selection-change', listener);
    document.body.append(element);
    expect(element.getAttribute('space-name')).toBe('Space');
    expect(element.getAttribute('doc-name')).toBe('Page');
    expect(element.locale).toBe('de');
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
  expect(css).not.toContain("@import 'tailwindcss';");
  expect(css).toContain("@import 'tailwindcss/utilities.css' layer(utilities)");
  expect(css).toContain('.cel-admin-surface h1');
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
