'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function ThemeInjector() {
  const site = useAppStore((s) => s.pageConfig.site);

  useEffect(() => {
    document.title = site.title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', site.description);
    if (site.keywords?.length) setMeta('keywords', site.keywords.join(', '));
    if (site.language) document.documentElement.lang = site.language;
  }, [site]);

  return null;
}
