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

export default {
  plugins: [conditionalTailwind(), autoprefixer()],
};
