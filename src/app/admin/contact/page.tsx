"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EditContact() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Contact States
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        const { contact } = json.data;
        setPhone(contact.phone || '');
        setWhatsappNumber(contact.whatsappNumber || '');
        setAddress(contact.address || '');
        setHours(contact.hours || '');
        setInstagramUrl(contact.instagramUrl || '');
        setMapEmbedUrl(contact.mapEmbedUrl || '');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load contact info.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'contact',
          data: {
            phone,
            whatsappNumber,
            address,
            hours,
            instagramUrl,
            mapEmbedUrl,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to update contact info.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-ivory/60 space-y-4">
        <Loader2 className="animate-spin text-cherry-500" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Contact Info...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Contact & Location</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Address, operational schedules, map pin links, and social hooks
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Messages */}
        {success && (
          <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
            <CheckCircle size={16} />
            <span>Contact credentials updated successfully! Changes are live.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Salon Calling Hotline (Label)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="093598 00006"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Main Booking WhatsApp Number (Country code + digits, no spaces)
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="919359800006"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
              Physical Street Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Model Town Road, near Sigma Ultrasound, Model Town, Panipat"
              className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Operational Schedules / Hours
              </label>
              <input
                type="text"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Daily, 9:00 AM – 9:00 PM"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Instagram URL
              </label>
              <input
                type="url"
                required
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/makeup_by_gularora"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
              Google Maps Embed URL (iframe src link only)
            </label>
            <input
              type="url"
              required
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3.5 text-xs text-ivory font-mono transition-colors"
            />
            <span className="text-[9px] text-ivory/40 block mt-2 leading-relaxed">
              To obtain this: search for the location on Google Maps, click "Share", choose "Embed a map", and copy the **src attribute URL** inside the iframe tags.
            </span>
          </div>
        </div>

        {/* Actions Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl border border-cherry-500/20 shadow-lg cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Saving Info...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Contact Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


