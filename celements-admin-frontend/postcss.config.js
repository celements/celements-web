import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const tw = tailwindcss();

function conditionalTailwind() {
  return {
    postcssPlugin: 'conditional-tailwindcss',
    Once(root, helpers) {
      const from =
        helpers?.result?.opts?.from ||
        root?.source?.input?.file ||
        root?.source?.input?.from ||
        '';

      // Skip vendor CSS (e.g. node_modules/vuefinder/dist/vuefinder.css)
      if (from.includes('/node_modules/')) {
        return;
      }

      // Delegate to Tailwind for your own CSS entry
      if (typeof tw.Once === 'function') {
        return tw.Once(root, helpers);
      }
    },
  };
}
conditionalTailwind.postcss = true;

export default {
  plugins: [
    conditionalTailwind(),
    autoprefixer(),
  ],
};
