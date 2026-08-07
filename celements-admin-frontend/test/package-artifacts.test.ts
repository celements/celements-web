import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postcss from 'postcss';
import { describe, expect, test } from 'vitest';

const projectFile = (...path: string[]) => resolve(process.cwd(), ...path);
const packageCssPath = projectFile('dist/package/styles.css');
const deployableCssPath = projectFile('dist/assets/vendor.css');
const deployableApplicationCssPath = projectFile('dist/assets/embedded.css');
const builtArtifactsAvailable = [
  packageCssPath,
  deployableCssPath,
  deployableApplicationCssPath,
].every(existsSync);
const packageCss = builtArtifactsAvailable ? readFileSync(packageCssPath, 'utf8') : '';
const deployableCss = builtArtifactsAvailable ? readFileSync(deployableCssPath, 'utf8') : '';
const deployableApplicationCss = builtArtifactsAvailable
  ? readFileSync(deployableApplicationCssPath, 'utf8')
  : '';
const explicitlyNamespacedVendorSelectors = [
  /^\.vuefinder(?:\b|__|--)/,
  /^\.vf-/,
  /^\.vue-(?:advanced-cropper|bounding-box|circle-stencil|draggable-area|handler-wrapper|line-wrapper|preview|rectangle-stencil|simple-handler|simple-line)(?:\b|__|--)/,
  /^\.os-/,
  /^\.sonner-/,
  /^\.uppy-/,
  /^\[data-overlayscrollbars/,
  /^\[data-sonner-/,
  /^:is\(\.vuefinder/,
  /^:where\(\.vuefinder/,
];

const selectors = (css: string) => {
  const result: string[] = [];
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && rule.parent.name.includes('keyframes')) return;
    result.push(...(rule.selectors ?? []).map((selector) => selector.trim()));
  });
  return result;
};

const isContainedOrNamespaced = (selector: string) =>
  selector.includes('.cel-admin-surface') ||
  selector.includes('.cel-admin-teleport') ||
  /\[data-v-[a-f0-9]+\]/.test(selector) ||
  explicitlyNamespacedVendorSelectors.some((pattern) => pattern.test(selector));

const expectContainedCss = (css: string) => {
  const builtSelectors = selectors(css);
  expect(builtSelectors.filter((selector) => !isContainedOrNamespaced(selector))).toEqual([]);
  expect(builtSelectors).not.toContain(':root');
  expect(builtSelectors).not.toContain('.disabled');
  expect(builtSelectors).not.toContain('.fade-enter-active');
  expect(builtSelectors).not.toContain('.fade-leave-active');
  expect(builtSelectors.filter((selector) => /^(?:html|body|h[1-6]|\*)\b/.test(selector))).toEqual(
    []
  );
};

describe.skipIf(!builtArtifactsAvailable)('published stylesheet', () => {
  test('contains processed application and VueFinder CSS without internal imports', () => {
    expect(packageCss).toContain('.cel-admin-surface');
    expect(packageCss).toContain('.vuefinder__menubar');
    expect(packageCss).toContain('.vuefinder__preview-modal');
    expect(
      postcss
        .parse(packageCss)
        .nodes.some((node) => node.type === 'atrule' && node.name === 'import')
    ).toBe(false);
    expect(readFileSync(projectFile('dist/package/styles.js'), 'utf8')).not.toContain('vuefinder');
  });

  test('contains generic vendor and reset selectors within an admin boundary', () => {
    expectContainedCss(packageCss);
    expect(packageCss).toMatch(/\.cel-admin-surface[^{}]*\.cropper-viewers/);
    expect(packageCss).toMatch(/\.cel-admin-surface[^{}]*\.disabled/);
  });

  test('retains VueFinder and PrimeVue teleport styling', () => {
    const builtSelectors = selectors(packageCss);
    expect(
      builtSelectors.some(
        (selector) =>
          selector.includes('.vuefinder__modal-layout') && selector.includes('.fade-enter-active')
      )
    ).toBe(true);
    expect(
      builtSelectors.some(
        (selector) => selector.includes('.cel-admin-teleport') && selector.includes('.fixed')
      )
    ).toBe(true);
    expect(builtSelectors.some((selector) => selector.startsWith('[data-sonner-toaster]'))).toBe(
      true
    );
  });
});

test.skipIf(!builtArtifactsAvailable)(
  'deployable VueFinder CSS uses the same containment contract',
  () => {
    expect(deployableCss).toContain('.vuefinder__menubar');
    expectContainedCss(deployableCss);
    expectContainedCss(deployableApplicationCss);
  }
);

test.skipIf(!builtArtifactsAvailable)(
  'published package exposes only supported entry points and built targets',
  () => {
    const packageJson = JSON.parse(readFileSync(projectFile('package.json'), 'utf8')) as {
      exports: Record<string, string | Record<string, string>>;
    };
    expect(Object.keys(packageJson.exports)).toEqual([
      '.',
      './runtime',
      './page-attachments',
      './page-attachments-island',
      './styles.css',
    ]);
    expect(packageJson.exports).not.toHaveProperty('./src/*');
    for (const target of Object.values(packageJson.exports).flatMap((entry) =>
      typeof entry === 'string' ? [entry] : Object.values(entry)
    )) {
      expect(existsSync(projectFile(target))).toBe(true);
    }
  }
);

test('legacy attachment templates retain island and asynchronous loading paths', () => {
  const templateRoot = projectFile('..', 'celements-webapp/src/main/webapp/templates');
  const inline = readFileSync(resolve(templateRoot, 'celTemplates/attachmentsinline.vm'), 'utf8');
  const editorTab = readFileSync(
    resolve(templateRoot, 'celEditorTabs/loadTabAttachments.vm'),
    'utf8'
  );
  const island = readFileSync(
    resolve(templateRoot, 'celTemplates/pageAttachmentsIsland.vm'),
    'utf8'
  );
  expect(inline).toContain("#parse('celTemplates/pageAttachmentsIsland.vm')");
  expect(editorTab).toContain("#parse('celTemplates/pageAttachmentsIsland.vm')");
  expect(island).toContain('class="cel_lazyloadJS_exec"');
  expect(island).toContain("import('$pageAttachmentsModule')");
  expect(island).toContain('<cel-page-attachments');
});
