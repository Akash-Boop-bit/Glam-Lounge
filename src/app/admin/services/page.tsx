"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Plus, Trash2, Edit2, Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  services: ServiceItem[];
}

export default function EditServices() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Categories data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');

  // Modal / Form state for Add/Edit Service
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Fields for Service Modal
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvImage, setSrvImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data.categories || []);
        if (json.data.categories && json.data.categories.length > 0) {
          setActiveCategoryId(json.data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load services data.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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
        setSrvImage(data.url);
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveServices = async (updatedCategories: Category[]) => {
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'categories',
          data: updatedCategories,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Failed to save services changes.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Open Modal to Add Service
  const openAddModal = () => {
    setModalMode('add');
    setEditingServiceId(null);
    setSrvName('');
    setSrvDesc('');
    setSrvPrice('On request');
    setSrvImage('https://images.unsplash.com/photo-1487412947147-5cebf100ffc2');
    setShowModal(true);
  };

  // Open Modal to Edit Service
  const openEditModal = (service: ServiceItem) => {
    setModalMode('edit');
    setEditingServiceId(service.id);
    setSrvName(service.name);
    setSrvDesc(service.description);
    setSrvPrice(service.price);
    setSrvImage(service.image);
    setShowModal(true);
  };

  // Form Submit for adding/editing service within current category
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCategories = categories.map((cat) => {
      if (cat.id !== activeCategoryId) return cat;

      let updatedServices = [...cat.services];

      if (modalMode === 'add') {
        // Generate new ID
        const newId = srvName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newService: ServiceItem = {
          id: `${newId}-${Date.now()}`,
          name: srvName,
          description: srvDesc,
          price: srvPrice,
          image: srvImage,
        };
        updatedServices.push(newService);
      } else if (modalMode === 'edit' && editingServiceId) {
        updatedServices = updatedServices.map((srv) =>
          srv.id === editingServiceId
            ? { ...srv, name: srvName, description: srvDesc, price: srvPrice, image: srvImage }
            : srv
        );
      }

      return { ...cat, services: updatedServices };
    });

    setCategories(updatedCategories);
    setShowModal(false);
    // Auto-save changes to file
    handleSaveServices(updatedCategories);
  };

  // Delete Service Action
  const handleDeleteService = (serviceId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    const updatedCategories = categories.map((cat) => {
      if (cat.id !== activeCategoryId) return cat;
      const updatedServices = cat.services.filter((srv) => srv.id !== serviceId);
      return { ...cat, services: updatedServices };
    });

    setCategories(updatedCategories);
    handleSaveServices(updatedCategories);
  };

  // Edit Category details
  const handleCategoryFieldChange = (field: 'name' | 'description', value: string) => {
    const updatedCategories = categories.map((cat) => {
      if (cat.id !== activeCategoryId) return cat;
      return { ...cat, [field]: value };
    });
    setCategories(updatedCategories);
  };

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-ivory/60 space-y-4">
        <Loader2 className="animate-spin text-cherry-500" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-charcoal-lighter pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">Manage Services</h1>
          <span className="text-[10px] tracking-widest text-cherry-300 font-semibold uppercase">
            Service categories and individual price lists
          </span>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center space-x-3 bg-green-950/20 border border-green-900/30 p-4 rounded-xl text-green-400 text-xs">
          <CheckCircle size={16} />
          <span>Services database updated successfully! Changes are live.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 bg-cherry-900/10 border border-cherry-900/20 p-4 rounded-xl text-cherry-400 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-charcoal-lighter pb-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-5 py-3 text-[10px] uppercase tracking-widest font-semibold rounded-full border transition-all ${
              activeCategoryId === cat.id
                ? 'bg-cherry-700 border-cherry-500 text-white shadow-md'
                : 'bg-charcoal-light border-cherry-900/20 text-ivory/60 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="space-y-8">
          {/* Category Info editor card */}
          <div className="bg-charcoal-light border border-cherry-900/20 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-md font-bold text-white mb-2">Category Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Category Name
                </label>
                <input
                  type="text"
                  value={activeCategory.name}
                  onChange={(e) => handleCategoryFieldChange('name', e.target.value)}
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Category Tagline / Description
                </label>
                <input
                  type="text"
                  value={activeCategory.description}
                  onChange={(e) => handleCategoryFieldChange('description', e.target.value)}
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors font-light"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveServices(categories)}
                className="inline-flex items-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory text-[9px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border border-cherry-900/40 cursor-pointer"
              >
                <span>Save Category Meta</span>
              </button>
            </div>
          </div>

          {/* Services list and Add button */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-white">Services List</h3>
              <button
                onClick={openAddModal}
                className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 text-white text-[10px] font-semibold uppercase tracking-widest px-5 py-3 rounded-xl border border-cherry-500/25 cursor-pointer shadow-md"
              >
                <Plus size={12} />
                <span>Add Service</span>
              </button>
            </div>

            {/* List Table Grid */}
            <div className="grid grid-cols-1 gap-4">
              {activeCategory.services && activeCategory.services.length > 0 ? (
                activeCategory.services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-charcoal-light/60 hover:bg-charcoal-light border border-cherry-900/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-grow w-full">
                      {/* Image Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-cherry-900/40">
                        <Image src={service.image} alt={service.name} fill sizes="80px" className="object-cover" />
                      </div>
                      
                      {/* Text details */}
                      <div className="flex-grow text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1.5 justify-center sm:justify-start">
                          <h4 className="font-serif text-base font-bold text-white">
                            {service.name}
                          </h4>
                          <span className="text-gold text-xs font-semibold font-mono bg-charcoal px-2 py-0.5 rounded border border-cherry-900/30">
                            {service.price}
                          </span>
                        </div>
                        <p className="text-xs text-ivory/60 font-light leading-relaxed max-w-xl">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2.5 text-ivory/60 hover:text-white border border-cherry-900/30 hover:border-cherry-300/30 rounded-xl bg-charcoal/40 transition-colors cursor-pointer"
                        title="Edit service details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2.5 text-cherry-500 hover:text-cherry-300 border border-cherry-900/30 hover:border-cherry-300/30 rounded-xl bg-charcoal/40 transition-colors cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-ivory/40 border border-dashed border-cherry-900/20 rounded-2xl bg-charcoal-light/10">
                  No services added in this category. Click "Add Service" to start.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Add/Edit Service */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal-light border border-cherry-900/40 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-lg font-bold text-white mb-6 border-b border-charcoal-lighter pb-3">
              {modalMode === 'add' ? 'Add New Service' : 'Edit Service Details'}
            </h3>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="Bridal HD Airbrush Makeup"
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Pricing *
                  </label>
                  <input
                    type="text"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    placeholder="On request OR ₹1500"
                    className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors font-mono"
                  />
                </div>

                {/* Service image select */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                    Upload Service Thumbnail
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="service-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="service-image-upload"
                      className="w-full inline-flex items-center justify-center space-x-2 bg-charcoal hover:bg-charcoal-lighter text-ivory/80 text-xs py-3 rounded-xl border border-cherry-900/30 cursor-pointer transition-colors"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={12} />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>Upload Thumbnail</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/60 block mb-2 font-medium">
                  Service Description
                </label>
                <textarea
                  rows={3}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Describe what's included in this styling package..."
                  className="w-full bg-charcoal border border-cherry-900/30 focus:border-cherry-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/20 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Upload image preview */}
              {srvImage && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ivory/40 block mb-2">Thumbnail Preview</span>
                  <div className="relative h-24 w-40 rounded-xl overflow-hidden border border-cherry-900/40">
                    <Image src={srvImage} alt="Thumbnail Preview" fill sizes="160px" className="object-cover" />
                  </div>
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-charcoal-lighter">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 text-[10px] uppercase tracking-widest font-semibold text-ivory/60 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="inline-flex items-center space-x-2 bg-cherry-700 hover:bg-cherry-500 disabled:bg-cherry-900/50 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl border border-cherry-500/25 cursor-pointer shadow-md"
                >
                  <span>{modalMode === 'add' ? 'Add Service' : 'Update Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
