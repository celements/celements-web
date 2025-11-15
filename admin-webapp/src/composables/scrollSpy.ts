import { useLogger } from '@/utils/logger';
import { onBeforeUnmount, onMounted, ref, watchEffect, type Ref } from 'vue';

export interface SpySection {
  element: HTMLElement | null;
  route: string;
}

export function useScrollSpy(
  sections: Ref<SpySection[]>,
  options?: {
    threshold?: number;
    rootMargin?: string;
  }
) {
  const logger = useLogger('useScrollSpy');

  const navigationLinks = ref<HTMLAnchorElement[]>([]);
  const activeNavLink = ref<HTMLAnchorElement | undefined>(undefined);
  const activeSection = ref<string>('');
  const visibilityMap = ref<Record<string, boolean>>({});

  let observer: IntersectionObserver | null = null;

  const activateSection = (topSection: SpySection) => {
    activeSection.value = topSection.route;
    if (activeNavLink.value) {
      activeNavLink.value.classList.remove(
        'router-link-active',
        'router-link-exact-active',
        'text-türkis-100'
      );
    }
    activeNavLink.value = navigationLinks.value.find((link) => {
      const href = link.getAttribute('href');
      return href === `${topSection.route}`;
    });
    activeNavLink.value?.classList.add(
      'router-link-active',
      'router-link-exact-active',
      'text-türkis-100'
    );
    history.replaceState({}, '', `${window.location.origin}${topSection.route}`);
  };

  const createObserver = () => {
    observer = new IntersectionObserver(
      (entries) => {
        // Entries only contains elements where intersection changed. Fully visible elements are not included.
        // To determine the topmost visible section, we need to include all visible sections.
        entries.forEach((entry) => {
          const id = entry.target.id;
          visibilityMap.value[id] = entry.isIntersecting;
        });
        const visibleSections = sections.value.filter(
          (section) => section.element?.id && visibilityMap.value[section.element.id]
        );
        logger.debug('visibleSections: ', visibleSections);
        visibleSections.sort(
          (a, b) =>
            (a.element?.getBoundingClientRect().top || 0) -
            (b.element?.getBoundingClientRect().top || 0)
        );
        if (visibleSections.length > 0) {
          const topSection = visibleSections[0];
          if (activeSection.value !== topSection.route) {
            activateSection(topSection);
          }
        }
      },
      {
        root: null,
        threshold: options?.threshold ?? 0.75,
        rootMargin: options?.rootMargin ?? '-130px 0px 0px 0px',
      }
    );
    watchEffect(() => {
      sections.value.forEach((section) => {
        logger.debug('section element: ', section.element);
        if (section.element) {
          observer?.observe(section.element);
        }
      });
      document
        .getElementById('navigation')
        ?.querySelectorAll('ul li a')
        .forEach((link) => {
          logger.debug('link: ', link);
          navigationLinks.value.push(link as HTMLAnchorElement);
        });
    });
  };
  onMounted(() => {
    createObserver();
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
  });
  return {
    activeSection,
  };
}
