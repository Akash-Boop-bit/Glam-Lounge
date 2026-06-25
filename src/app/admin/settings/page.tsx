"use client";

import React, { useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    // Form validations
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/admin/auth/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Password save error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Security Settings</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Rotate administration passwords
          </span>
        </div>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Messages */}
          {success && (
            <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
              <CheckCircle size={16} />
              <span>Password rotated successfully! Use your new password on subsequent logins.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form container */}
          <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="font-serif text-base font-bold text-white border-b border-charcoal-lighter pb-3 flex items-center">
              <ShieldAlert size={16} className="text-cherry-500 mr-2" />
              Change Admin Password
            </h3>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors font-mono"
              />
            </div>

            <div className="border-t border-charcoal-lighter/40 pt-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Trigger */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl border border-cherry-500/20 shadow-lg cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Updating Key...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
