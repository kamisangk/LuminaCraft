'use client';

import React from 'react';
import { ModuleInstance } from '@/store/useAppStore';

export function ImageModule({ module }: { module: ModuleInstance }) {
  const { src = '', alt = '', objectFit = 'cover', link = '', openInNewTab = true } = module.props;

  const imageElement = (
    <img
      src={src as string}
      alt={alt as string}
      className="h-full w-full"
      style={{ objectFit: (objectFit as any) || 'cover' }}
      loading="lazy"
      draggable={false}
    />
  );

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs opacity-30">
        未配置图片内容
      </div>
    );
  }

  if (link) {
    return (
      <a
        href={link as string}
        target={openInNewTab ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="block h-full w-full overflow-hidden"
      >
        {imageElement}
      </a>
    );
  }

  return <div className="h-full w-full overflow-hidden">{imageElement}</div>;
}
