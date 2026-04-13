'use client';

import React from 'react';

export const inputBase =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition-colors placeholder:opacity-30 focus:border-blue-400/60 focus:bg-white/8';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest opacity-30"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function PanelBlock({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <div className="mb-3">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-[11px] leading-relaxed opacity-40" style={{ color: 'var(--color-text)' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium opacity-50" style={{ color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
  monospace = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  monospace?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputBase} ${monospace ? 'font-mono text-xs' : ''} ${className}`}
      style={{ color: 'var(--color-text)' }}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  monospace = false,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  monospace?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${inputBase} resize-y leading-relaxed ${monospace ? 'font-mono text-xs' : ''}`}
      style={{ color: 'var(--color-text)' }}
    />
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
      style={{ color: 'var(--color-text)' }}
    >
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-blue-400" />
    </label>
  );
}

export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
        />
        <TextInput value={value} onChange={onChange} monospace className="flex-1" />
      </div>
    </Field>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-white/10'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} cursor-pointer`}
      style={{ color: 'var(--color-text)' }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function toHexSafe(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;

  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbMatch) return '#000000';

  const [r, g, b] = rgbMatch[1]
    .split(',')
    .slice(0, 3)
    .map((part) => Number(part.trim()));

  if ([r, g, b].some((value) => !Number.isFinite(value))) {
    return '#000000';
  }

  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')}`;
}
