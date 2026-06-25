"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EditHomepage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [headline, setHeadline] = useState('');
  const [punchline, setPunchline] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutImage, setAboutImage] = useState('');

  const [rating, setRating] = useState('');
  const [reviewsCount, setReviewsCount] = useState('');
  const [established, setEstablished] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState('');

  // Image uploading states
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        const { homepage, business } = json.data;
        setHeadline(homepage.headline || '');
        setPunchline(homepage.punchline || '');
        setHeroImage(homepage.heroImage || '');
        setAboutText(homepage.aboutText || '');
        setAboutImage(homepage.aboutImage || '');

        setRating(business.rating || '');
        setReviewsCount(business.reviewsCount || '');
        setEstablished(business.established || '');
        setInstagramFollowers(business.instagramFollowers || '');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load page content.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'hero') setUploadingHero(true);
    else setUploadingAbout(true);

    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        if (type === 'hero') setHeroImage(data.url);
        else setAboutImage(data.url);
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload.');
    } finally {
      if (type === 'hero') setUploadingHero(false);
      else setUploadingAbout(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      // First save business stats
      const resStats = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'business',
          data: { rating, reviewsCount, established, instagramFollowers },
        }),
      });

      // Save homepage text
      const resHome = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'homepage',
          data: { headline, punchline, heroImage, aboutText, aboutImage },
        }),
      });

      const dataStats = await resStats.json();
      const dataHome = await resHome.json();

      if (dataStats.success && dataHome.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError('Failed to save some changes.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update website content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-ivory/60 space-y-4">
        <Loader2 className="animate-spin text-cherry-500" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Edit Homepage</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Hero details, business stats, and brand narrative
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Status Messages */}
        {success && (
          <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
            <CheckCircle size={16} />
            <span>Homepage content saved successfully! Changes are live on the website.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Hero Section Card */}
        <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-lg font-bold text-white border-b border-charcoal-lighter pb-3">
            Hero Area
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Main Headline (H1)
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Glam Lounge Luxury Salon"
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Sub-Headline / Punchline
                </label>
                <textarea
                  rows={2}
                  required
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  placeholder="Best Bridal Makeup Artist in Panipat"
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Hero Image upload */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Hero Background Image
              </label>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-cherry-900/30 bg-charcoal flex items-center justify-center group mb-3">
                {heroImage ? (
                  <Image src={heroImage} alt="Hero Background Preview" fill sizes="350px" className="object-cover opacity-60" />
                ) : (
                  <span className="text-xs text-ivory/30">No Image Uploaded</span>
                )}
                
                {/* Upload spinner */}
                {uploadingHero && (
                  <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-cherry-500" size={24} />
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'hero')}
                  className="hidden"
                  id="hero-upload"
                  disabled={uploadingHero}
                />
                <label
                  htmlFor="hero-upload"
                  className="inline-flex items-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory/80 text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-cherry-900/40 hover:border-cherry-300/30 cursor-pointer"
                >
                  <Upload size={12} />
                  <span>Choose New Background Image</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Business Stats Section */}
        <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-lg font-bold text-white border-b border-charcoal-lighter pb-3">
            Business Metrics & Stats
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Google Rating (out of 5)
              </label>
              <input
                type="text"
                required
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="5.0"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Google Reviews Count
              </label>
              <input
                type="text"
                required
                value={reviewsCount}
                onChange={(e) => setReviewsCount(e.target.value)}
                placeholder="120+"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Established Year
              </label>
              <input
                type="text"
                required
                value={established}
                onChange={(e) => setEstablished(e.target.value)}
                placeholder="2018"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Instagram Followers
              </label>
              <input
                type="text"
                required
                value={instagramFollowers}
                onChange={(e) => setInstagramFollowers(e.target.value)}
                placeholder="10,000+"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* About Section Card */}
        <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-serif text-lg font-bold text-white border-b border-charcoal-lighter pb-3">
            About Section
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                About Description / Narrative
              </label>
              <textarea
                rows={6}
                required
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Glam Lounge is Model Town's premier unisex destination..."
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/20 transition-colors leading-relaxed"
              />
            </div>

            {/* About Image upload */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                About Image (Salon Interior)
              </label>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-cherry-900/30 bg-charcoal flex items-center justify-center group mb-3">
                {aboutImage ? (
                  <Image src={aboutImage} alt="About Section Preview" fill sizes="350px" className="object-cover opacity-60" />
                ) : (
                  <span className="text-xs text-ivory/30">No Image Uploaded</span>
                )}
                
                {/* Upload spinner */}
                {uploadingAbout && (
                  <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-cherry-500" size={24} />
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'about')}
                  className="hidden"
                  id="about-upload"
                  disabled={uploadingAbout}
                />
                <label
                  htmlFor="about-upload"
                  className="inline-flex items-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory/80 text-[10px] font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-cherry-900/40 hover:border-cherry-300/30 cursor-pointer"
                >
                  <Upload size={12} />
                  <span>Choose New About Image</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl border border-cherry-500/20 shadow-lg cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Homepage Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
