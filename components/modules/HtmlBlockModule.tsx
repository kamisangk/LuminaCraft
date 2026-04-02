'use client';

import React, { useEffect, useRef } from 'react';
import { ModuleInstance } from '@/store/useAppStore';

export function HtmlBlockModule({ module }: { module: ModuleInstance }) {
  const { htmlContent } = module.props;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof htmlContent !== 'string') return;

    // 动态导入 DOMPurify 仅在客户端
    import('dompurify').then((mod) => {
      const DOMPurify = mod.default;
      const clean = DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['class', 'id'],
        FORCE_BODY: false,
      });
      if (containerRef.current) {
        containerRef.current.innerHTML = clean;
      }
    });
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
    />
  );
}
