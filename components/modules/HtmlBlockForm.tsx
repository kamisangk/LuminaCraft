'use client';

import React from 'react';
import { useAppStore, ModuleInstance } from '@/store/useAppStore';
import { Field, TextArea } from '@/components/panels/FormPrimitives';

export function HtmlBlockForm({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const htmlContent = typeof module.props.htmlContent === 'string' ? module.props.htmlContent : '';

  return (
    <Field label="HTML 文档">
      <TextArea
        value={htmlContent}
        onChange={(v) => updateModuleProps(module.id, { htmlContent: v })}
        rows={16}
        monospace
        placeholder="支持完整 HTML 文档，例如 <!DOCTYPE html><html>...</html>"
      />
      <div className="mt-2 text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
        内容会通过 iframe 渲染，支持 HTML / CSS / JS，并在沙箱环境中运行。
      </div>
    </Field>
  );
}
