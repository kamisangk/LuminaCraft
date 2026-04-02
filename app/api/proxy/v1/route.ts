import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  data: unknown;
  fetchedAt: number;
}

interface InflightEntry {
  promise: Promise<GithubPayload>;
}

interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  archived: boolean;
  fork: boolean;
}

interface GithubHeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface GithubHeatmapWeek {
  days: GithubHeatmapDay[];
}

interface GithubHeatmap {
  weeks: GithubHeatmapWeek[];
}

interface GithubPayload {
  user: GithubUser;
  repos: GithubRepo[];
  heatmap: GithubHeatmap | null;
  heatmapAvailable: boolean;
  heatmapError: string | null;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, InflightEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const MAX_REPO_LIMIT = 8;

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_ALLOWED_HOSTS = new Set(['api.github.com', 'github.com']);
const CONTRIBUTIONS_HOST = 'github.com';
const HEATMAP_ROW_PATTERN = /<tr[^>]*style="height:\s*11px"[^>]*>([\s\S]*?)<\/tr>/g;
const HEATMAP_CELL_PATTERN = /<td[^>]*data-date="([^"]+)"[^>]*data-level="([0-4])"[^>]*><\/td>\s*<tool-tip[^>]*>([\s\S]*?)<\/tool-tip>/g;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getCached(cacheKey: string) {
  const cached = cache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
    cache.delete(cacheKey);
    return null;
  }
  return cached.data;
}

function setCached(cacheKey: string, data: GithubPayload) {
  cache.set(cacheKey, { data, fetchedAt: Date.now() });
}

function shouldCachePayload(data: GithubPayload) {
  return data.heatmapError === null;
}

function getStaleCached(cacheKey: string) {
  return cache.get(cacheKey)?.data as GithubPayload | undefined;
}

async function fetchJson<T>(url: string): Promise<T> {
  const parsed = new URL(url);
  if (!GITHUB_ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error('Upstream host is not allowed');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'LuminaCraft-Proxy/1.0',
      },
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      if (upstream.status === 404) {
        throw new Error('GitHub 用户不存在');
      }
      throw new Error(`GitHub upstream error: ${upstream.status}`);
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('Unexpected upstream content type');
    }

    return (await upstream.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url: string): Promise<string> {
  const parsed = new URL(url);
  if (parsed.hostname !== CONTRIBUTIONS_HOST) {
    throw new Error('Upstream host is not allowed');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'LuminaCraft-Proxy/1.0',
      },
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      if (upstream.status === 404) {
        throw new Error('GitHub 用户不存在');
      }
      throw new Error(`GitHub upstream error: ${upstream.status}`);
    }

    return await upstream.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseContributionCount(tooltipHtml: string) {
  const text = tooltipHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const match = text.match(/(\d+)\s+contributions?/i);
  if (match) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  if (/no contributions?/i.test(text)) {
    return 0;
  }
  return null;
}

function parseGithubHeatmap(html: string): GithubHeatmap | null {
  const rows = Array.from(html.matchAll(HEATMAP_ROW_PATTERN));
  if (rows.length === 0) {
    return null;
  }

  const rowDays = rows.map((row) => {
    const cells: GithubHeatmapDay[] = [];

    for (const match of row[1].matchAll(HEATMAP_CELL_PATTERN)) {
      const [, date, levelRaw, tooltipHtml] = match;
      const level = Number(levelRaw);
      const count = parseContributionCount(tooltipHtml);
      if (!date || !Number.isInteger(level) || count === null) {
        continue;
      }
      cells.push({
        date,
        level: Math.min(Math.max(level, 0), 4) as GithubHeatmapDay['level'],
        count,
      });
    }

    return cells;
  });

  const weekCount = Math.max(...rowDays.map((days) => days.length));
  if (!Number.isFinite(weekCount) || weekCount === 0) {
    return null;
  }

  const weeks: GithubHeatmapWeek[] = [];
  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const days = rowDays
      .map((row) => row[weekIndex])
      .filter((day): day is GithubHeatmapDay => Boolean(day));
    weeks.push({ days });
  }

  return weeks.length > 0 ? { weeks } : null;
}

async function fetchGithubHeatmap(username: string): Promise<GithubHeatmap | null> {
  const html = await fetchText(`${new URL(`/users/${encodeURIComponent(username)}/contributions`, `https://${CONTRIBUTIONS_HOST}`).toString()}`);
  return parseGithubHeatmap(html);
}

function normalizeRepoLimit(value: string | null) {
  const parsed = Number(value ?? 4);
  if (!Number.isFinite(parsed)) return 4;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_REPO_LIMIT);
}

async function getGithubPayload(username: string, repoLimit: number, showHeatmap: boolean): Promise<GithubPayload> {
  const [user, repos, heatmapResult] = await Promise.all([
    fetchJson<GithubUser>(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`),
    fetchJson<GithubRepo[]>(
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${repoLimit}`
    ),
    showHeatmap
      ? fetchGithubHeatmap(username)
          .then((heatmap) => ({ heatmap, error: null as string | null }))
          .catch((error: unknown) => ({
            heatmap: null,
            error: error instanceof Error ? error.message : 'Failed to fetch GitHub heatmap',
          }))
      : Promise.resolve({ heatmap: null, error: null as string | null }),
  ]);

  return {
    user,
    repos: repos.filter((repo) => !repo.fork).slice(0, repoLimit),
    heatmap: heatmapResult.heatmap,
    heatmapAvailable: showHeatmap && heatmapResult.heatmap !== null,
    heatmapError: heatmapResult.error,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const plugin = searchParams.get('plugin');

  if (plugin !== 'github') {
    return jsonError('Unsupported plugin', 400);
  }

  const username = searchParams.get('username')?.trim();
  if (!username) {
    return jsonError('Missing username parameter', 400);
  }

  const repoLimit = normalizeRepoLimit(searchParams.get('repoLimit'));
  const showHeatmap = searchParams.get('showHeatmap') === '1';
  const cacheKey = `${plugin}:${username}:${repoLimit}:${showHeatmap ? 'heatmap' : 'basic'}`;
  const cached = getCached(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const existingInflight = inflight.get(cacheKey);
  if (existingInflight) {
    try {
      const data = await existingInflight.promise;
      return NextResponse.json(data, {
        headers: { 'X-Cache': 'HIT' },
      });
    } catch (err) {
      const stale = getStaleCached(cacheKey);
      if (stale) {
        return NextResponse.json(stale, {
          headers: { 'X-Cache': 'STALE' },
        });
      }
      console.error('[GET /api/proxy/v1] inflight fetch error:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch upstream';
      const status = message === 'GitHub 用户不存在' ? 404 : 502;
      return jsonError(message, status);
    }
  }

  const request = getGithubPayload(username, repoLimit, showHeatmap);
  inflight.set(cacheKey, { promise: request });

  try {
    const data = await request;
    if (shouldCachePayload(data)) {
      setCached(cacheKey, data);
    }
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    const stale = getStaleCached(cacheKey);
    if (stale) {
      return NextResponse.json(stale, {
        headers: { 'X-Cache': 'STALE' },
      });
    }
    console.error('[GET /api/proxy/v1] fetch error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch upstream';
    const status = message === 'GitHub 用户不存在' ? 404 : 502;
    return jsonError(message, status);
  } finally {
    inflight.delete(cacheKey);
  }
}
