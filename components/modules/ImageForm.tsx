'use client';

import React from 'react';
import { useAppStore, ModuleInstance } from '@/store/useAppStore';
import { Field, TextInput, Select, ToggleRow } from '@/components/panels/FormPrimitives';

export function ImageForm({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const {
    src = '',
    alt = '',
    objectFit = 'cover',
    link = '',
    openInNewTab = true,
  } = module.props;

  const OBJECT_FIT_OPTIONS = [
    { label: '覆盖 (Cover)', value: 'cover' },
    { label: '包含 (Contain)', value: 'contain' },
    { label: '拉伸 (Fill)', value: 'fill' },
    { label: '原始尺寸 (None)', value: 'none' },
    { label: '居中缩小 (Scale Down)', value: 'scale-down' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Field label="图片 URL">
        <TextInput
          value={src as string}
          onChange={(v) => updateModuleProps(module.id, { src: v })}
          placeholder="https://example.com/image.jpg"
          monospace
        />
      </Field>

      <Field label="替代文本 (Alt Text)">
        <TextInput
          value={alt as string}
          onChange={(v) => updateModuleProps(module.id, { alt: v })}
          placeholder="图片描述"
        />
      </Field>

      <Field label="填充方式 (Object Fit)">
        <Select
          value={objectFit as string}
          onChange={(v) => updateModuleProps(module.id, { objectFit: v })}
          options={OBJECT_FIT_OPTIONS}
        />
      </Field>

      <Field label="点击跳转链接 (可选)">
        <TextInput
          value={link as string}
          onChange={(v) => updateModuleProps(module.id, { link: v })}
          placeholder="https://google.com"
          monospace
        />
      </Field>

      {!!link && (
        <ToggleRow
          label="在新窗口打开"
          checked={openInNewTab as boolean}
          onChange={(v) => updateModuleProps(module.id, { openInNewTab: v })}
        />
      )}
    </div>
  );
}
