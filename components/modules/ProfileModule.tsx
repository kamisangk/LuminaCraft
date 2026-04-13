'use client';

import React from 'react';
import Image from 'next/image';
import { ModuleInstance } from '@/store/useAppStore';

interface ProfileProps {
  name: string;
  bio: string;
  avatar: string;
  links: { label: string; url: string }[];
}

export function ProfileModule({ module }: { module: ModuleInstance }) {
  const { name, bio, avatar, links } = module.props as unknown as ProfileProps;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4 text-center">
      <div
        className="relative h-20 w-20 overflow-hidden rounded-full border-2 shadow-lg"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-primary) 58%, white 12%)',
          boxShadow: '0 10px 30px color-mix(in srgb, var(--color-primary) 28%, transparent)',
        }}
      >
        <Image
          src={avatar || 'https://avatars.githubusercontent.com/u/0'}
          alt={name || 'Avatar'}
          fill
          className="object-cover"
          loading="lazy"
          sizes="80px"
        />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          {name}
        </h2>
        <p className="mt-1 text-sm opacity-70 leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {bio}
        </p>
      </div>
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-3 py-1 text-xs transition-colors duration-200"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-primary) 42%, transparent)',
                color: 'color-mix(in srgb, var(--color-text) 92%, white 8%)',
                background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 24%, transparent)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 14%, transparent)';
                e.currentTarget.style.color = 'color-mix(in srgb, var(--color-text) 92%, white 8%)';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
