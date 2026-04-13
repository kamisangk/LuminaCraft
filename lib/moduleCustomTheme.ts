interface BuildCustomThemeArtifactsInput {
  moduleId: string;
  scopeSelector: string;
  cssVars: string;
  source: string;
}

interface BuildCustomThemeArtifactsResult {
  scopedCss: string;
  svgMarkup: string | null;
}

const STYLE_BLOCK_REGEX = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const SVG_BLOCK_REGEX = /<svg\b[\s\S]*?<\/svg>/gi;
const SVG_SCRIPT_REGEX = /<script\b[\s\S]*?<\/script>/gi;
const SVG_EVENT_HANDLER_REGEX = /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SVG_ID_REGEX = /\bid=(["'])([^"']+)\1/gi;
const FRAGMENT_URL_REGEX = /url\(\s*(['"]?)#([^)'" \t\r\n]+)\1\s*\)/gi;
const FRAGMENT_HREF_REGEX = /\b(xlink:href|href)=(["'])#([^"']+)\2/gi;

interface CssBlock {
  selector: string;
  body: string;
}

export function buildCustomThemeArtifacts({
  moduleId,
  scopeSelector,
  cssVars,
  source,
}: BuildCustomThemeArtifactsInput): BuildCustomThemeArtifactsResult {
  if (!source.trim()) {
    return {
      scopedCss: cssVars,
      svgMarkup: null,
    };
  }

  const idPrefix = `lc-${sanitizeToken(moduleId)}-`;
  const idMap = new Map<string, string>();
  const svgBlocks: string[] = [];

  let cssSource = source.replace(STYLE_BLOCK_REGEX, (_match, css) => `\n${css}\n`);
  cssSource = cssSource.replace(SVG_BLOCK_REGEX, (svgMarkup) => {
    const rewrittenSvg = rewriteSvgMarkup(svgMarkup, idPrefix, idMap);
    if (rewrittenSvg) {
      svgBlocks.push(rewrittenSvg);
    }
    return '\n';
  });

  const rewrittenCss = rewriteFragmentReferences(cssSource.trim(), idMap);
  const scopedCustomCss = scopeCssSelectors(rewrittenCss, scopeSelector);

  return {
    scopedCss: scopedCustomCss ? `${cssVars}\n${scopedCustomCss}` : cssVars,
    svgMarkup: svgBlocks.length > 0 ? svgBlocks.join('\n') : null,
  };
}

function rewriteSvgMarkup(svgMarkup: string, idPrefix: string, idMap: Map<string, string>): string {
  const seenIds = new Set(idMap.values());
  let nextCollisionIndex = 1;
  const sanitizedSvg = sanitizeSvgMarkup(svgMarkup);

  const withPrefixedIds = sanitizedSvg.replace(SVG_ID_REGEX, (_match, quote, rawId) => {
    const originalId = rawId.trim();
    if (!originalId) {
      return '';
    }

    if (!idMap.has(originalId)) {
      const baseId = `${idPrefix}${sanitizeToken(originalId)}`;
      let nextId = baseId;

      while (seenIds.has(nextId)) {
        nextId = `${baseId}-${nextCollisionIndex}`;
        nextCollisionIndex += 1;
      }

      seenIds.add(nextId);
      idMap.set(originalId, nextId);
    }

    return `id=${quote}${idMap.get(originalId)}${quote}`;
  });

  return rewriteFragmentReferences(withPrefixedIds, idMap).trim();
}

function sanitizeSvgMarkup(svgMarkup: string): string {
  return svgMarkup
    .replace(SVG_SCRIPT_REGEX, '')
    .replace(SVG_EVENT_HANDLER_REGEX, '');
}

function rewriteFragmentReferences(input: string, idMap: Map<string, string>): string {
  return input
    .replace(FRAGMENT_URL_REGEX, (match, quote, rawId) => {
      const nextId = idMap.get(rawId);
      if (!nextId) {
        return match;
      }
      return `url(${quote}#${nextId}${quote})`;
    })
    .replace(FRAGMENT_HREF_REGEX, (match, attr, quote, rawId) => {
      const nextId = idMap.get(rawId);
      if (!nextId) {
        return match;
      }
      return `${attr}=${quote}#${nextId}${quote}`;
    });
}

function scopeCssSelectors(source: string, scopeSelector: string): string {
  const blocks = extractTopLevelCssBlocks(source);

  return blocks
    .map(({ selector, body }) => {
      const normalizedSelector = selector.trim();
      const normalizedBody = body.trim();

      if (!normalizedSelector || !normalizedBody) {
        return '';
      }

      if (shouldKeepAtRuleUnscoped(normalizedSelector)) {
        return `${normalizedSelector} {${normalizedBody}}`;
      }

      if (shouldScopeNestedAtRule(normalizedSelector)) {
        return `${normalizedSelector} {${scopeCssSelectors(normalizedBody, scopeSelector)}}`;
      }

      const scopedSelector = normalizedSelector
        .split(',')
        .map((part) => scopeSingleSelector(part, scopeSelector))
        .join(', ');

      return `${scopedSelector} {${normalizedBody}}`;
    })
    .filter(Boolean)
    .join('\n');
}

function extractTopLevelCssBlocks(source: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let selectorStart = 0;
  let bodyStart = -1;
  let depth = 0;
  let currentSelector = '';
  let inComment = false;
  let activeQuote: '"' | "'" | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (inComment) {
      if (char === '*' && nextChar === '/') {
        inComment = false;
        index += 1;
      }
      continue;
    }

    if (activeQuote) {
      if (char === activeQuote && source[index - 1] !== '\\') {
        activeQuote = null;
      }
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      activeQuote = char;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        currentSelector = source.slice(selectorStart, index).trim();
        bodyStart = index + 1;
      }
      depth += 1;
      continue;
    }

    if (char === '}') {
      if (depth === 0) {
        continue;
      }

      depth -= 1;
      if (depth === 0 && bodyStart >= 0) {
        const body = source.slice(bodyStart, index).trim();
        blocks.push({
          selector: currentSelector,
          body,
        });
        selectorStart = index + 1;
        bodyStart = -1;
        currentSelector = '';
      }
    }
  }

  return blocks;
}

function scopeSingleSelector(selector: string, scopeSelector: string): string {
  const trimmedSelector = selector.trim();

  if (!trimmedSelector) {
    return scopeSelector;
  }

  if (trimmedSelector.includes('&')) {
    return trimmedSelector.replaceAll('&', scopeSelector);
  }

  if (trimmedSelector.startsWith(':root')) {
    return trimmedSelector.replace(':root', scopeSelector);
  }

  return `${scopeSelector} ${trimmedSelector}`;
}

function shouldKeepAtRuleUnscoped(selector: string): boolean {
  return (
    selector.startsWith('@keyframes') ||
    selector.startsWith('@font-face') ||
    selector.startsWith('@property')
  );
}

function shouldScopeNestedAtRule(selector: string): boolean {
  return (
    selector.startsWith('@media') ||
    selector.startsWith('@supports') ||
    selector.startsWith('@container') ||
    selector.startsWith('@layer')
  );
}

function sanitizeToken(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || 'module';
}
