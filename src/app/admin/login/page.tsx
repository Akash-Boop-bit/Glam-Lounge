"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-6 py-12 relative overflow-hidden select-none">
      {/* Decorative ambient backdrop glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cherry-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cherry-700/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-charcoal-light border border-cherry-900/40 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Salon Header Branding */}
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-bold tracking-widest text-white uppercase block">
            Glam Lounge
          </span>
          <span className="font-sans text-[9px] tracking-[0.25em] text-cherry-300 font-semibold uppercase block opacity-80 mt-1">
            LUXURY SALON — CMS ADMIN
          </span>
        </div>

        {/* Form Block */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="admin-password"
              className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium"
            >
              Enter Admin Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ivory/30 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl pl-10 pr-10 py-3.5 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ivory/30 hover:text-cherry-300 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Form validation alert */}
          {error && (
            <p className="text-xs text-cherry-500 font-medium text-center bg-cherry-900/10 border border-cherry-900/20 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Login Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 disabled:text-ivory/50 text-ivory text-[10px] font-semibold uppercase tracking-[0.18em] py-4 rounded-xl border border-cherry-500/20 shadow-[0_0_15px_rgba(140,31,58,0.2)] hover:shadow-[0_0_20px_rgba(217,79,112,0.4)] transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In To Dashboard'}
          </button>
        </form>

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-[9px] uppercase tracking-widest text-ivory/40 hover:text-cherry-300 underline underline-offset-4 transition-all"
          >
            ← Return to public website
          </a>
        </div>

      </div>
    </div>
  );
}
