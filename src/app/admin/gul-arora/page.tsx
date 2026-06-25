"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EditGulArora() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Founder details state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [credentials, setCredentials] = useState<string[]>([]);
  const [newCredential, setNewCredential] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        const { gulArora } = json.data;
        setName(gulArora.name || '');
        setTitle(gulArora.title || '');
        setPhoto(gulArora.photo || '');
        setBio(gulArora.bio || '');
        setWhatsappNumber(gulArora.whatsappNumber || '');
        setInstagram(gulArora.instagram || '');
        setInstagramHandle(gulArora.instagramHandle || '');
        setCredentials(gulArora.credentials || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load Gul Arora data.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        setPhoto(data.url);
      } else {
        setError(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredential.trim()) return;

    setCredentials([...credentials, newCredential.trim()]);
    setNewCredential('');
  };

  const handleDeleteCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
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
          section: 'gulArora',
          data: {
            name,
            title,
            photo,
            bio,
            whatsappNumber,
            instagram,
            instagramHandle,
            credentials,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to save changes.');
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
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Founder Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Founder Profile</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Gul Arora bio biography, credentials, and image
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Messages */}
        {success && (
          <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
            <CheckCircle size={16} />
            <span>Founder profile updated successfully! Changes are live.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info Columns (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-5">
              <h3 className="font-serif text-base font-bold text-white border-b border-charcoal-lighter pb-3">
                Biography Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Branding Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Biography Copy
                </label>
                <textarea
                  rows={5}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/20 transition-colors leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@makeup_by_gularora"
                    className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Instagram Profile Link
                  </label>
                  <input
                    type="url"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Direct WhatsApp Hotline (Country code + digits, no spaces)
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

            {/* Credentials Editor */}
            <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-5">
              <h3 className="font-serif text-base font-bold text-white border-b border-charcoal-lighter pb-3">
                Founder Credentials & Badges
              </h3>

              {/* Add Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCredential}
                  onChange={(e) => setNewCredential(e.target.value)}
                  placeholder="Certified HD Makeup Artist — Canada"
                  className="flex-grow bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCredential}
                  className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-white text-[10px] font-bold uppercase tracking-widest px-5 rounded-xl border border-cherry-500/20 cursor-pointer shadow-md"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </button>
              </div>

              {/* List */}
              <ul className="space-y-2 pt-2">
                {credentials && credentials.length > 0 ? (
                  credentials.map((cred, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-charcoal border border-cherry-900/10 rounded-xl p-3.5"
                    >
                      <span className="text-xs text-ivory/80 font-light">{cred}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCredential(index)}
                        className="text-cherry-500 hover:text-cherry-300 transition-colors p-1"
                        title="Remove credential"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-6 text-ivory/30 text-xs italic">
                    No credentials entries added.
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* Photo upload column (4 Columns) */}
          <div className="lg:col-span-4 bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 space-y-5">
            <h3 className="font-serif text-base font-bold text-white border-b border-charcoal-lighter pb-3">
              Portrait Image
            </h3>

            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-cherry-900/30 bg-charcoal flex items-center justify-center group mb-4">
              {photo ? (
                <Image src={photo} alt="Gul Arora portrait preview" fill sizes="350px" className="object-cover opacity-60" />
              ) : (
                <span className="text-xs text-ivory/30">No Image Uploaded</span>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center">
                  <Loader2 className="animate-spin text-cherry-500" size={24} />
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-picker"
                disabled={uploading}
              />
              <label
                htmlFor="photo-picker"
                className="w-full inline-flex items-center justify-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory/80 text-[10px] font-semibold uppercase tracking-wider py-3 rounded-xl border border-cherry-900/40 hover:border-cherry-300/30 cursor-pointer transition-colors"
              >
                <Upload size={12} className="text-cherry-500" />
                <span>Upload Portrait Photo</span>
              </label>
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-4 border-t border-charcoal-lighter">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl border border-cherry-500/20 shadow-lg cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Founder Details</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
