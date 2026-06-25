"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  image: string;
}

export default function EditGallery() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Add Item state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('bridal');
  const [newImage, setNewImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    { label: 'Bridal Makeovers', value: 'bridal' },
    { label: 'Party Makeup', value: 'party' },
    { label: 'Hair Care & Styling', value: 'hair' },
    { label: 'Nails & Skin Care', value: 'nails' },
    { label: 'Makeup Academy', value: 'academy' },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        setGallery(json.data.gallery || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load gallery items.');
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
        setNewImage(data.url);
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGallery = async (updatedGallery: GalleryItem[]) => {
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'gallery',
          data: updatedGallery,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGallery(data.data.gallery);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage || !newTitle) return;

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      image: newImage,
    };

    const updatedGallery = [newItem, ...gallery];
    setGallery(updatedGallery);
    
    // Reset Form Fields
    setNewTitle('');
    setNewImage('');
    
    // Auto Save
    handleSaveGallery(updatedGallery);
  };

  const handleDeleteItem = (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this image from your portfolio?');
    if (!confirmDelete) return;

    const updatedGallery = gallery.filter((item) => item.id !== id);
    setGallery(updatedGallery);
    handleSaveGallery(updatedGallery);
  };

  const filteredGallery = activeFilter === 'all'
    ? gallery
    : gallery.filter((item) => item.category === activeFilter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-ivory/60 space-y-4">
        <Loader2 className="animate-spin text-cherry-500" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Portfolio Gallery</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Upload and tag transformation photos
          </span>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
          <CheckCircle size={16} />
          <span>Portfolio database updated successfully! Changes are live.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload Form Block (Left / 4 Columns) */}
        <div className="lg:col-span-4 bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 space-y-5">
          <h3 className="font-serif text-base font-bold text-white border-b border-charcoal-lighter pb-3">
            Add Photo to Portfolio
          </h3>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Classic Gold Bridal Look"
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Portfolio Tag/Category *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-charcoal-light text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                Upload Image (max 5MB) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="gallery-image-picker"
                  disabled={uploading}
                />
                <label
                  htmlFor="gallery-image-picker"
                  className="w-full inline-flex items-center justify-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory/80 text-xs py-3 rounded-xl border border-cherry-900/30 cursor-pointer transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin text-cherry-500" size={12} />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} className="text-cherry-500" />
                      <span>Choose Image File</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Preview image */}
            {newImage && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-ivory/40 block">Preview</span>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-cherry-900/40">
                  <Image src={newImage} alt="Upload Preview" fill sizes="320px" className="object-cover" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !newImage || !newTitle}
              className="w-full inline-flex items-center justify-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest py-3.5 rounded-xl border border-cherry-500/25 cursor-pointer shadow-md transition-colors disabled:cursor-not-allowed"
            >
              <Plus size={12} />
              <span>Add to Portfolio</span>
            </button>
          </form>
        </div>

        {/* Gallery Grid (Right / 8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category Filter bar */}
          <div className="flex space-x-2 border-b border-charcoal-lighter pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-[9px] uppercase tracking-widest font-semibold rounded-full border transition-all ${
                activeFilter === 'all'
                  ? 'bg-cherry-700 border-cherry-500 text-white'
                  : 'bg-charcoal-light border-cherry-900/20 text-ivory/60'
              }`}
            >
              Show All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className={`px-4 py-2 text-[9px] uppercase tracking-widest font-semibold rounded-full border transition-all shrink-0 ${
                  activeFilter === cat.value
                    ? 'bg-cherry-700 border-cherry-500 text-white shadow-md'
                    : 'bg-charcoal-light border-cherry-900/20 text-ivory/60 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Images */}
          {filteredGallery && filteredGallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-cherry-900/25 bg-charcoal group"
                >
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 50vw, 250px" className="object-cover" />
                  
                  {/* Delete trigger overlay */}
                  <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                    <span className="text-[8px] uppercase tracking-wider text-cherry-300 font-semibold bg-charcoal-light/60 px-2 py-0.5 rounded border border-cherry-900/30 self-start">
                      {item.category}
                    </span>
                    
                    <div className="flex justify-between items-center w-full">
                      <h5 className="text-[10px] text-white font-serif font-bold truncate max-w-[70%]">
                        {item.title}
                      </h5>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-950/80 hover:bg-cherry-900 p-2 rounded-lg border border-cherry-500/20 text-cherry-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-ivory/40 border border-dashed border-cherry-900/20 rounded-3xl bg-charcoal-light/10">
              No portfolio photos found in this category.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
