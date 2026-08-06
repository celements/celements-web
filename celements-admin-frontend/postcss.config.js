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
const globalSelectors = new Set([
  '*',
  ':after',
  ':before',
  '::after',
  '::backdrop',
  '::before',
  '::file-selector-button',
]);

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
          if (trimmed === ':root' || trimmed === ':host') return adminScope;
          if (globalSelectors.has(trimmed)) return `${adminScope} ${trimmed}`;
          if (
            isApplicationStyles &&
            !trimmed.includes('.cel-admin-surface') &&
            !trimmed.includes('.cel-admin-teleport')
          ) {
            return `${adminScope} ${trimmed}, ${adminScope}${trimmed}`;
          }
          return selector;
        });
      });
    },
  };
}
scopeAdminStyles.postcss = true;

export default {
  plugins: [conditionalTailwind(), scopeAdminStyles(), autoprefixer()],
};
