'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ModuleInstance } from '@/store/useAppStore';

function buildHtmlDocument(htmlContent: string) {
  const trimmed = htmlContent.trim();
  const isFullDocument = /<!doctype\s+html|<html[\s>]/i.test(trimmed);

  if (isFullDocument) {
    return htmlContent;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: auto;
    }

    body {
      color: inherit;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
}

export function HtmlBlockModule({ module }: { module: ModuleInstance }) {
  const htmlContent = typeof module.props.htmlContent === 'string' ? module.props.htmlContent : '';
  const htmlDocument = useMemo(() => buildHtmlDocument(htmlContent), [htmlContent]);
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [htmlDocument]);

  if (!blobUrl) {
    return <div className="h-full w-full" />;
  }

  return (
    <iframe
      key={`${module.id}-${blobUrl}`}
      title={module.title || 'html-block'}
      className="h-full w-full border-0"
      src={blobUrl}
      sandbox="allow-scripts"
    />
  );
}
