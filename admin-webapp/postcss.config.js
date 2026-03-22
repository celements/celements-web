import tailwindcss from '@tailwindcss/postcss'; // Neu: Aus @tailwindcss/postcss laden
import autoprefixer from 'autoprefixer';

const tw = tailwindcss();

function conditionalTailwind() {
  return {
    postcssPlugin: 'conditional-tailwindcss',
    // In v4 nutzt Tailwind primär den "Once"-Hook
    Once(root, helpers) {
      const from =
        helpers?.result?.opts?.from || root?.source?.input?.file || root?.source?.input?.from || '';

      // Skip vendor CSS
      if (from.includes('/node_modules/')) {
        return;
      }

      // v4 Plugin Delegation
      if (typeof tw.Once === 'function') {
        return tw.Once(root, helpers);
      }
    },
  };
}
conditionalTailwind.postcss = true;

export default {
  plugins: [conditionalTailwind(), autoprefixer()],
};
