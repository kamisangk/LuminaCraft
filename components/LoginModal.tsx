'use client';

import React, { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function LoginModal({ onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? '密码错误');
      }
    } catch {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-80 rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: 'rgba(13,17,23,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div>
          <h2 className="text-base font-semibold text-white">拥有者验证</h2>
          <p className="text-xs text-white/40 mt-1">输入管理员密码以进入编辑模式</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理员密码"
            autoFocus
            className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-white/5 border border-white/10 focus:border-blue-400/60 transition-colors text-white placeholder:text-white/30"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '验证中…' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
