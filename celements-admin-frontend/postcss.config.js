import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const tw = tailwindcss();

/**
 * Wrap each sub-plugin in the Tailwind v4 composite plugin so that
 * vendor CSS from node_modules is skipped while all other files are
 * processed normally.
 */
function wrapOnce(originalOnce) {
  return function (root, helpers) {
    const from =
      helpers?.result?.opts?.from || root?.source?.input?.file || root?.source?.input?.from || '';
    if (from.includes('/node_modules/')) {
      return;
    }
    return originalOnce(root, helpers);
  };
}

function conditionalTailwind() {
  // Tailwind v4 exposes a composite plugin with a `plugins` array
  if (Array.isArray(tw.plugins)) {
    return {
      postcssPlugin: 'conditional-tailwindcss',
      plugins: tw.plugins.map((sub) => ({
        ...sub,
        ...(typeof sub.Once === 'function' ? { Once: wrapOnce(sub.Once) } : {}),
      })),
    };
  }

  // Fallback for a simple plugin with a direct Once hook
  return {
    postcssPlugin: 'conditional-tailwindcss',
    ...(typeof tw.Once === 'function' ? { Once: wrapOnce(tw.Once) } : {}),
  };
}
conditionalTailwind.postcss = true;

const adminScope = ':where(.cel-admin-surface, .cel-admin-teleport)';
const vueFinderTeleportScope =
  ':where(.vuefinder__themer, .vuefinder__modal-layout, [data-sonner-toaster])';
const globalSelectors = new Set([
  '*',
  ':after',
  ':before',
  '::after',
  '::backdrop',
  '::before',
  '::file-selector-button',
]);
const vueFinderGlobalSelectorAllowlist = [
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

function isExplicitlyNamespacedVueFinderSelector(selector) {
  return vueFinderGlobalSelectorAllowlist.some((pattern) => pattern.test(selector));
}

function replaceDocumentRoot(selector, scope) {
  const directionMatch = selector.match(/^html\[dir=(ltr|rtl)\]/);
  if (directionMatch) {
    return selector.replace(directionMatch[0], `${scope}:dir(${directionMatch[1]})`);
  }
  return selector
    .replace(/^html(?:\[[^\]]+\])?\s*>\s*body/, scope)
    .replace(/^html(?:\[[^\]]+\])?/, scope)
    .replace(/^body/, scope);
}

function scopeSelector(selector, scope) {
  if (selector === ':root' || selector === ':host') return scope;
  if (/^(?:html|body)(?:\b|\[|:|\s|>)/.test(selector)) {
    return replaceDocumentRoot(selector, scope);
  }
  const descendant = `${scope} ${selector}`;
  if (/^[.[:]/.test(selector)) return `${descendant}, ${scope}${selector}`;
  return descendant;
}

function scopeVueFinderSelector(selector) {
  return [adminScope, vueFinderTeleportScope]
    .map((scope) => scopeSelector(selector, scope))
    .join(', ');
}

function scopeAdminStyles() {
  return {
    postcssPlugin: 'scope-celements-admin-styles',
    OnceExit(root, helpers) {
      const from = helpers?.result?.opts?.from || root?.source?.input?.file || '';
      const isApplicationStyles = from.includes('/src/assets/main.css');
      if (!isApplicationStyles && !from.includes('/node_modules/vuefinder/')) return;
      root.walkRules((rule) => {
        if (rule.parent?.type === 'atrule' && rule.parent.name.includes('keyframes')) return;
        rule.selectors = rule.selectors.map((selector) => {
          const trimmed = selector.trim();
          if (isApplicationStyles) {
            if (trimmed === ':root' || trimmed === ':host') return adminScope;
            if (globalSelectors.has(trimmed)) return `${adminScope} ${trimmed}`;
            if (
              !trimmed.includes('.cel-admin-surface') &&
              !trimmed.includes('.cel-admin-teleport')
            ) {
              return scopeSelector(trimmed, adminScope);
            }
            return selector;
          }
          if (isExplicitlyNamespacedVueFinderSelector(trimmed)) return selector;
          return scopeVueFinderSelector(trimmed);
        });
      });
    },
  };
}
scopeAdminStyles.postcss = true;

export default {
  plugins: [conditionalTailwind(), scopeAdminStyles(), autoprefixer()],
};
