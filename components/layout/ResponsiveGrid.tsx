'use client';

import React, { useCallback } from 'react';
import { ResponsiveGridLayout, useContainerWidth, noCompactor } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import { useAppStore, LayoutRect, Breakpoint } from '@/store/useAppStore';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xl: 1600,
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
};

const COLS: Record<Breakpoint, number> = {
  xl: 12,
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
};

export function ResponsiveGrid() {
  const { pageConfig, isEditMode, updateLayouts, bringModuleToFront } = useAppStore();
  const { layouts, modules } = pageConfig;

  const { width, containerRef } = useContainerWidth();

  const handleLayoutChange = useCallback(
    (_current: Layout, allLayouts: ResponsiveLayouts) => {
      if (!isEditMode) return;
      updateLayouts(allLayouts as unknown as Record<string, LayoutRect[]>);
    },
    [isEditMode, updateLayouts]
  );

  const handleDragStart = useCallback(
    (
      _layout: Layout,
      _oldItem: LayoutRect | null,
      _newItem: LayoutRect | null,
      _placeholder: LayoutRect | null,
      _event: Event,
      element: HTMLElement | null
    ) => {
      if (_newItem?.i) {
        bringModuleToFront(_newItem.i);
      }
      if (element) {
        element.style.zIndex = '999999';
        const parent = element.parentElement;
        if (parent) {
          parent.appendChild(element);
        }
      }
    },
    [bringModuleToFront]
  );

  const handleDragStop = useCallback(
    (
      _layout: Layout,
      _oldItem: LayoutRect | null,
      _newItem: LayoutRect | null,
      _placeholder: LayoutRect | null,
      _event: Event,
      element: HTMLElement | null
    ) => {
      if (element) {
        element.style.zIndex = '';
      }
    },
    []
  );

  const rglLayouts: ResponsiveLayouts = Object.fromEntries(
    Object.entries(layouts).map(([bp, rects]) => [
      bp,
      rects.map((r) => ({ ...r })),
    ])
  );

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={rglLayouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={60}
        compactor={noCompactor}
        dragConfig={{ enabled: isEditMode }}
        resizeConfig={{ enabled: isEditMode }}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onLayoutChange={handleLayoutChange}
        margin={[12, 12]}
        containerPadding={[16, 16]}
        width={width ?? 1200}
      >
        {modules.map((mod) => (
          <div key={mod.id}>
            <ModuleWrapper module={mod} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
