'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GithubPluginSettings, ModuleInstance } from '@/store/useAppStore';

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

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-primary) 18%, rgba(255,255,255,0.08))',
        background: 'color-mix(in srgb, var(--color-primary) 8%, rgba(255,255,255,0.03))',
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.18em]"
        style={{ color: 'color-mix(in srgb, var(--color-text) 38%, transparent)' }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-lg font-semibold"
        style={{ color: 'color-mix(in srgb, var(--color-text) 96%, white 4%)' }}
      >
        {formatNumber(value)}
      </div>
    </div>
  );
}

function getHeatmapCellBackground(level: GithubHeatmapDay['level']) {
  switch (level) {
    case 0:
      return 'rgba(255,255,255,0.06)';
    case 1:
      return 'color-mix(in srgb, var(--color-primary) 28%, rgba(255,255,255,0.12))';
    case 2:
      return 'color-mix(in srgb, var(--color-primary) 48%, rgba(255,255,255,0.14))';
    case 3:
      return 'color-mix(in srgb, var(--color-primary) 66%, rgba(255,255,255,0.16))';
    case 4:
      return 'color-mix(in srgb, var(--color-primary) 82%, rgba(255,255,255,0.18))';
    default:
      return 'rgba(255,255,255,0.06)';
  }
}

function HeatmapCard({ heatmap }: { heatmap: GithubHeatmap }) {
  const days = heatmap.weeks.flatMap((week) => week.days);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const displayedWeeks = heatmap.weeks;
  const heatmapScaleStyles = {
    cardPaddingX: 'calc(var(--module-padding) * 0.75)',
    cardPaddingY: 'calc(var(--module-padding) * 0.75)',
    headerGap: 'calc(var(--module-gap) * 0.75)',
    legendGap: 'calc(var(--module-gap) * 0.35)',
    legendFontSize: 'calc(10px * var(--module-font-scale))',
    titleFontSize: 'calc(10px * var(--module-font-scale))',
    summaryFontSize: 'calc(14px * var(--module-font-scale))',
    legendCellSize: 'calc(10px * var(--module-font-scale))',
    cellRadius: 'calc(4px * var(--module-font-scale))',
    gridGap: 'calc(3px * var(--module-font-scale))',
  } as const;

  const showRangeHint = displayedWeeks.length < heatmap.weeks.length;
  const weekColumnTemplate = `repeat(${displayedWeeks.length}, minmax(0, 1fr))`;
  const legendCellSize = 'clamp(8px, calc(10px * var(--module-font-scale)), 14px)';

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-primary) 18%, rgba(255,255,255,0.08))',
        background: 'color-mix(in srgb, var(--color-primary) 5%, rgba(255,255,255,0.03))',
        padding: `${heatmapScaleStyles.cardPaddingY} ${heatmapScaleStyles.cardPaddingX}`,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: heatmapScaleStyles.headerGap, gap: heatmapScaleStyles.headerGap }}>
        <div>
          <div
            className="uppercase tracking-[0.18em]"
            style={{
              color: 'color-mix(in srgb, var(--color-text) 38%, transparent)',
              fontSize: heatmapScaleStyles.titleFontSize,
            }}
          >
            Contributions
          </div>
          <div
            className="mt-1 font-medium"
            style={{ color: 'var(--color-text)', fontSize: heatmapScaleStyles.summaryFontSize }}
          >
            最近一年 {formatNumber(total)} 次贡献
          </div>
        </div>
        <div
          className="flex items-center"
          style={{
            color: 'color-mix(in srgb, var(--color-text) 34%, transparent)',
            gap: heatmapScaleStyles.legendGap,
            fontSize: heatmapScaleStyles.legendFontSize,
          }}
        >
          <span>低</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              style={{
                background: getHeatmapCellBackground(level as GithubHeatmapDay['level']),
                width: legendCellSize,
                height: legendCellSize,
                borderRadius: heatmapScaleStyles.cellRadius,
              }}
            />
          ))}
          <span>高</span>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <div
          className="grid w-full"
          style={{
            gap: heatmapScaleStyles.gridGap,
            gridTemplateColumns: weekColumnTemplate,
          }}
        >
          {displayedWeeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-rows-7"
              style={{ gap: heatmapScaleStyles.gridGap }}
            >
              {week.days.map((day) => (
                <div
                  key={`${weekIndex}-${day.date}`}
                  className="border border-white/5 transition-transform hover:scale-110"
                  style={{
                    background: getHeatmapCellBackground(day.level),
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: heatmapScaleStyles.cellRadius,
                  }}
                  title={`${day.date} · ${formatNumber(day.count)} 次贡献`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {showRangeHint && (
        <div
          className="mt-2 text-[10px]"
          style={{ color: 'color-mix(in srgb, var(--color-text) 34%, transparent)' }}
        >
          当前模块展示最近 {displayedWeeks.length} 周贡献
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo }: { repo: GithubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border px-3 py-2 transition-colors"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-primary) 18%, rgba(255,255,255,0.08))',
        background: 'color-mix(in srgb, var(--color-primary) 5%, rgba(255,255,255,0.03))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 10%, rgba(255,255,255,0.03))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 5%, rgba(255,255,255,0.03))';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="truncate text-sm font-medium"
            style={{ color: 'color-mix(in srgb, var(--color-text) 96%, white 4%)' }}
          >
            {repo.name}
          </div>
          {repo.description && (
            <p
              className="mt-1 line-clamp-2 text-xs leading-relaxed"
              style={{ color: 'color-mix(in srgb, var(--color-text) 46%, transparent)' }}
            >
              {repo.description}
            </p>
          )}
        </div>
        {repo.archived && (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px]"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 24%, rgba(255,255,255,0.08))',
              color: 'color-mix(in srgb, var(--color-text) 48%, transparent)',
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            }}
          >
            Archived
          </span>
        )}
      </div>
      <div
        className="mt-2 flex flex-wrap items-center gap-2 text-[11px]"
        style={{ color: 'color-mix(in srgb, var(--color-text) 38%, transparent)' }}
      >
        {repo.language && <span>{repo.language}</span>}
        <span>★ {formatNumber(repo.stargazers_count)}</span>
        <span>⑂ {formatNumber(repo.forks_count)}</span>
        <span>更新于 {formatDate(repo.updated_at)}</span>
      </div>
    </a>
  );
}

export function GithubPlaceholderModule({ module }: { module: ModuleInstance }) {
  const settings = useMemo(() => {
    const raw = (module.props.pluginSettings ?? {}) as GithubPluginSettings;
    return {
      username: raw.username?.trim() ?? '',
      showProfile: raw.showProfile ?? true,
      showStats: raw.showStats ?? true,
      showRepos: raw.showRepos ?? true,
      showHeatmap: raw.showHeatmap ?? false,
      repoLimit: Math.min(Math.max(raw.repoLimit ?? 4, 1), 8),
    } satisfies Required<GithubPluginSettings>;
  }, [module.props.pluginSettings]);

  const [data, setData] = useState<GithubPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | ''>('');

  useEffect(() => {
    if (!settings.username) {
      setData(null);
      setError('请先在模块配置中填写 GitHub 用户名。');
      setCacheStatus('');
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      plugin: 'github',
      username: settings.username,
      repoLimit: String(settings.repoLimit),
    });
    if (settings.showHeatmap) {
      params.set('showHeatmap', '1');
    }

    fetch(`/api/proxy/v1?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as GithubPayload | { error?: string } | null;
        if (!res.ok) {
          throw new Error(body && 'error' in body ? body.error ?? '请求失败' : '请求失败');
        }
        setCacheStatus(res.headers.get('X-Cache') === 'HIT' ? 'HIT' : 'MISS');
        setData(body as GithubPayload);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setCacheStatus('');
        setError(err instanceof Error ? err.message : '加载 GitHub 数据失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [settings.repoLimit, settings.showHeatmap, settings.username]);

  if (!settings.username) {
    return (
      <div
        className="flex h-full items-center justify-center px-4 text-center text-sm"
        style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}
      >
        请先配置 GitHub 用户名。
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div
        className="flex h-full items-center justify-center px-4 text-center text-sm"
        style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}
      >
        正在加载 GitHub 数据…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm font-medium text-red-300">GitHub 数据加载失败</p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'color-mix(in srgb, var(--color-text) 42%, transparent)' }}
        >
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={data.user.avatar_url}
            alt={data.user.login}
            className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
          />
          <div className="min-w-0">
            <a
              href={data.user.html_url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm font-semibold transition-colors"
              style={{ color: 'color-mix(in srgb, var(--color-text) 96%, white 4%)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'color-mix(in srgb, var(--color-text) 100%, white 0%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'color-mix(in srgb, var(--color-text) 96%, white 4%)';
              }}
            >
              {data.user.name || data.user.login}
            </a>
            <div
              className="truncate text-xs"
              style={{ color: 'color-mix(in srgb, var(--color-text) 42%, transparent)' }}
            >
              @{data.user.login}
            </div>
            {data.user.bio && (
              <p
                className="mt-1 line-clamp-2 text-xs leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--color-text) 46%, transparent)' }}
              >
                {data.user.bio}
              </p>
            )}
          </div>
        </div>
        {cacheStatus && (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px]"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 24%, rgba(255,255,255,0.08))',
              color: 'color-mix(in srgb, var(--color-text) 38%, transparent)',
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            }}
          >
            Cache {cacheStatus}
          </span>
        )}
      </div>

      {settings.showProfile && (
        <div
          className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]"
          style={{ color: 'color-mix(in srgb, var(--color-text) 38%, transparent)' }}
        >
          {data.user.company && <span>{data.user.company}</span>}
          {data.user.location && <span>{data.user.location}</span>}
          <span>{formatNumber(data.user.followers)} followers</span>
          <span>{formatNumber(data.user.following)} following</span>
        </div>
      )}

      {settings.showStats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Repos" value={data.user.public_repos} />
          <StatCard label="Followers" value={data.user.followers} />
          <StatCard label="Following" value={data.user.following} />
        </div>
      )}

      {settings.showHeatmap && data.heatmap && <HeatmapCard heatmap={data.heatmap} />}
      {settings.showHeatmap && !data.heatmap && data.heatmapError && (
        <div
          className="rounded-xl border border-dashed px-3 py-3 text-xs"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-primary) 20%, rgba(255,255,255,0.08))',
            color: 'color-mix(in srgb, var(--color-text) 42%, transparent)',
          }}
        >
          贡献热力图暂时不可用
        </div>
      )}

      {settings.showRepos && (
        <div className="lumina-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1.5">
          {data.repos.length > 0 ? (
            data.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
          ) : (
            <div
              className="rounded-xl border border-dashed px-3 py-4 text-center text-xs"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, rgba(255,255,255,0.08))',
                color: 'color-mix(in srgb, var(--color-text) 38%, transparent)',
              }}
            >
              该用户暂无可展示的公开仓库。
            </div>
          )}
        </div>
      )}

      {error && data && <p className="text-xs text-amber-300/80">{error}</p>}
      {!error && data.heatmapError && settings.showHeatmap && (
        <p className="text-xs text-white/30">热力图数据获取失败，已自动降级。</p>
      )}
    </div>
  );
}
