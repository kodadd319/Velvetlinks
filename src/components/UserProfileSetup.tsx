import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  CheckCircle, 
  Ban,
  User,
  Lock,
  Type,
  FileText,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Briefcase,
  Film,
  Sparkles
} from 'lucide-react';
import { EscortProfile, UserAccount, BlockRecord } from '../types';
import { saveEscortProfile, getBlockedUsersForEscort, unblockUser, deleteEscortProfile } from '../lib/db';
import { CITIES_REGISTRY, resolveCityCoords } from '../utils/location';

interface UserProfileSetupProps {
  currentUser: UserAccount;
  existingProfile: EscortProfile | null;
  onProfileUpdated: (updated: EscortProfile) => void;
  onCustomizeProfile?: () => void;
  onProfileDeleted?: () => void;
}

export default function UserProfileSetup({ 
  currentUser, 
  existingProfile, 
  onProfileUpdated, 
  onCustomizeProfile,
  onProfileDeleted 
}: UserProfileSetupProps) {
  // Credentials & Core Fields
  const [username, setUsername] = useState(existingProfile?.username || '');
  const [password, setPassword] = useState(existingProfile?.password || '');
  const [name, setName] = useState(existingProfile?.name || currentUser.name || '');
  const [age, setAge] = useState<number | ''>(existingProfile?.age || '');
  const [gender, setGender] = useState<string>(existingProfile?.gender || '');
  const [languages, setLanguages] = useState<string[]>(existingProfile?.languages || []);
  const [languagesInput, setLanguagesInput] = useState(existingProfile?.languages?.join(', ') || '');

  // About & Presentation
  const [shortDescription, setShortDescription] = useState(existingProfile?.shortDescription || '');

  // Availability & Location
  const [location, setLocation] = useState(existingProfile?.location || '');
  const [availabilityDays, setAvailabilityDays] = useState(existingProfile?.availabilityDays || '');
  const [availabilityHours, setAvailabilityHours] = useState(existingProfile?.availabilityHours || '');

  // Services & Restrictions
  const [servicesInput, setServicesInput] = useState(existingProfile?.services?.join(', ') || '');
  const [restrictions, setRestrictions] = useState(existingProfile?.restrictions || '');

  // Media (Main & Gallery)
  const [mainImage, setMainImage] = useState<string>(existingProfile?.mainImage || (existingProfile?.images?.[0] || ''));
  const [gallery, setGallery] = useState<string[]>(existingProfile?.gallery || existingProfile?.images || []);

  // Blocking lists
  const [blockedList, setBlockedList] = useState<BlockRecord[]>([]);

  // Page UX States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProfile = async () => {
    if (!existingProfile) return;
    setIsDeleting(true);
    try {
      await deleteEscortProfile(existingProfile.id);
      if (onProfileDeleted) {
        onProfileDeleted();
      }
    } catch (err) {
      console.error('Failed to delete profile:', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Drag states
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Fetch blocked clients
  useEffect(() => {
    async function loadBlocks() {
      const list = await getBlockedUsersForEscort(currentUser.id);
      setBlockedList(list);
    }
    loadBlocks();
  }, [currentUser.id]);

  // Sync state if existing profile loads
  useEffect(() => {
    if (existingProfile) {
      setUsername(existingProfile.username || '');
      setPassword(existingProfile.password || '');
      setName(existingProfile.name);
      setAge(existingProfile.age || '');
      setGender(existingProfile.gender || '');
      setLanguages(existingProfile.languages || []);
      setLanguagesInput(existingProfile.languages?.join(', ') || '');
      setShortDescription(existingProfile.shortDescription || '');
      setLocation(existingProfile.location || '');
      setAvailabilityDays(existingProfile.availabilityDays || '');
      setAvailabilityHours(existingProfile.availabilityHours || '');
      setServicesInput(existingProfile.services?.join(', ') || '');
      setRestrictions(existingProfile.restrictions || '');
      setMainImage(existingProfile.mainImage || (existingProfile.images?.[0] || ''));
      setGallery(existingProfile.gallery || existingProfile.images || []);
    }
  }, [existingProfile]);

  // Main Image Upload handlers
  const handleDragMain = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveMain(true);
    } else if (e.type === "dragleave") {
      setDragActiveMain(false);
    }
  };

  const handleDropMain = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveMain(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMainImage = () => {
    setMainImage('');
  };

  // Gallery Upload handlers (up to 5 items)
  const handleDragGallery = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveGallery(true);
    } else if (e.type === "dragleave") {
      setDragActiveGallery(false);
    }
  };

  const processGalleryFiles = (files: File[]) => {
    const spaceLeft = 5 - gallery.length;
    if (spaceLeft <= 0) {
      alert("Gallery limit reached (max 5 items). Please remove existing items first.");
      return;
    }

    const filesToUpload = files.slice(0, spaceLeft);
    filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDropGallery = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesList = Array.from(e.dataTransfer.files) as File[];
      processGalleryFiles(filesList);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesList = Array.from(e.target.files) as File[];
      processGalleryFiles(filesList);
    }
  };

  const removeGalleryItem = (index: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUnblock = async (clientId: string) => {
    try {
      await unblockUser(currentUser.id, clientId);
      setBlockedList(prev => prev.filter(b => b.blockedId !== clientId));
    } catch (err) {
      console.error('Error unblocking client:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Resolve credentials fallbacks
    const finalUsername = username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${Date.now().toString().slice(-4)}`;
    const finalPassword = password || 'password';

    // Update local state to show generated credentials
    setUsername(finalUsername);
    setPassword(finalPassword);

    // Parse comma-separated text values
    const servicesList = servicesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const languagesList = languagesInput
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    // Resolve coordinates from selected city registry or default to base Miami coords
    const cityCoords = resolveCityCoords(location) || { lat: 25.7617, lng: -80.1918 };

    // Maintain an "images" array compatibility layer for lists that still expect it
    const legacyImagesArray = [
      ...(mainImage ? [mainImage] : []),
      ...gallery
    ].filter(Boolean);

    const updatedProfile: EscortProfile = {
      id: currentUser.id,
      userId: currentUser.id,
      name,
      description: '',
      services: servicesList,
      images: legacyImagesArray,
      videos: [],
      location,
      coords: { lat: cityCoords.lat, lng: cityCoords.lng },
      visibilityExpiry: null,
      rate: '',
      age: age === '' ? 0 : Number(age),
      gender,
      languages: languagesList,
      phone: '',
      whatsapp: '',
      // Expanded info fields
      username: finalUsername,
      password: finalPassword,
      shortDescription,
      availabilityDays,
      availabilityHours,
      restrictions,
      mainImage,
      gallery,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      views: existingProfile?.views || 0,
      rating: existingProfile?.rating || 4.9
    };

    try {
      await saveEscortProfile(updatedProfile);
      setIsSaving(false);
      setSaveSuccess(true);
      onProfileUpdated(updatedProfile);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setIsSaving(false);
    }
  };

  // Check if string is base64 video
  const isVideoData = (url: string) => {
    return url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.endsWith('.ogg');
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Info Input Form (8 columns) */}
        <div className="lg:col-span-8 space-y-8 bg-mahogany-gloss border border-gold/15 p-6 rounded-2xl text-leather">
          
          {/* Section: Credentials */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gold pb-2 border-b border-gold/10 flex items-center gap-2">
              <User className="w-4 h-4 text-gold" />
              <span>Login Info</span>
            </h3>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-gold/60" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. elenarostova"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gold/60" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <Type className="w-3 h-3 text-gold/60" />
                  <span>Display Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1">Age</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  <option value="" className="text-leather-dark">Select Gender...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gold pb-2 border-b border-gold/10 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold" />
              <span>Description</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-gold/60" />
                  <span>Description</span>
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Enter a short description about yourself..."
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
          </div>

          {/* Section: Location & Schedule */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gold pb-2 border-b border-gold/10 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>Schedule and Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold/60" />
                  <span>City, State</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Los Angeles, CA"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gold/60" />
                  <span>Availability Days</span>
                </label>
                <input
                  type="text"
                  value={availabilityDays}
                  onChange={(e) => setAvailabilityDays(e.target.value)}
                  placeholder="e.g. Monday - Saturday"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold/60" />
                  <span>Availability Hours</span>
                </label>
                <input
                  type="text"
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(e.target.value)}
                  placeholder="e.g. 10:00 AM - 11:00 PM"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-leather-dark font-bold uppercase mb-1">Languages (comma separated)</label>
              <input
                type="text"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                placeholder="English, French, Spanish"
                className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          {/* Section: Services & Restrictions */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gold pb-2 border-b border-gold/10 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gold" />
              <span>Services</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gold/60" />
                  <span>Services (comma separated)</span>
                </label>
                <input
                  type="text"
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  placeholder="Dinner Dates, Event Companionship, City Guide, etc"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs text-leather-dark font-bold uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gold/60" />
                  <span>Other Information</span>
                </label>
                <textarea
                  rows={3}
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  placeholder="e.g. Booking preferences, travel availability, special requests, etc"
                  className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Save Status & Button */}
          <div className="border-t border-gold/15 pt-6 flex items-center justify-between">
            {saveSuccess && (
              <div className="text-emerald-400 text-xs flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Saved successfully!</span>
              </div>
            )}
            <div />
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-gold to-gold-bright hover:shadow-lg hover:shadow-gold/15 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Media & Block sections (4 columns) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section: Main Profile Pic */}
          <div className="bg-mahogany-gloss border border-gold/15 p-6 rounded-2xl text-leather">
            <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2 border-b border-gold/15 pb-3 mb-4">
              <ImageIcon className="w-4 h-4 text-gold" />
              <span>Main Profile Picture</span>
            </h3>

            {/* Drag & Drop Main Pic */}
            {!mainImage ? (
              <div
                onDragEnter={handleDragMain}
                onDragOver={handleDragMain}
                onDragLeave={handleDragMain}
                onDrop={handleDropMain}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActiveMain 
                    ? 'border-gold bg-gold/5' 
                    : 'border-gold/20 hover:border-gold/40 bg-black/40'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-leather-dark mx-auto mb-2" />
                <p className="text-xs font-semibold text-leather">Upload Main Large Pic</p>
                <p className="text-[10px] text-leather-dark mt-1">No restrictions. NSFW allowed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square bg-black rounded-xl overflow-hidden border border-gold/15">
                  <img src={mainImage} alt="Main profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 text-leather-dark hover:text-red-400 rounded-full hover:bg-black transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-leather-dark">This image will represent you as your primary listing visual</p>
                </div>
              </div>
            )}
          </div>

          {/* Section: Gallery Uploads */}
          <div className="bg-mahogany-gloss border border-gold/15 p-6 rounded-2xl text-leather">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3 mb-4">
              <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
                <Film className="w-4 h-4 text-gold" />
                <span>Media Gallery</span>
              </h3>
              <span className="text-xs text-gold font-mono">{gallery.length}/5</span>
            </div>

            {/* Drag & Drop Gallery */}
            {gallery.length < 5 && (
              <div
                onDragEnter={handleDragGallery}
                onDragOver={handleDragGallery}
                onDragLeave={handleDragGallery}
                onDrop={handleDropGallery}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors mb-4 ${
                  dragActiveGallery 
                    ? 'border-gold bg-gold/5' 
                    : 'border-gold/20 hover:border-gold/40 bg-black/40'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleGalleryFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-7 h-7 text-leather-dark mx-auto mb-2" />
                <p className="text-xs font-semibold text-leather">Upload Images or Videos</p>
                <p className="text-[9px] text-leather-dark mt-1">Maximum 5 gallery items. NSFW allowed.</p>
              </div>
            )}

            {/* Gallery list */}
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {gallery.map((item, idx) => (
                  <div key={idx} className="relative aspect-square bg-black rounded-lg overflow-hidden border border-gold/15 group">
                    {isVideoData(item) ? (
                      <video src={item} muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={item} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    
                    {/* Media Type indicator overlay */}
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] text-leather-light font-mono">
                      {isVideoData(item) ? 'VIDEO' : 'IMAGE'}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/80 text-leather-dark hover:text-red-400 rounded-full hover:bg-black transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-leather-dark py-3 text-center">No gallery items uploaded yet</p>
            )}
          </div>



        </div>

      </div>

      {/* Unified Save Action Bar */}
      <div className="bg-gradient-to-b from-[#111] to-[#050505] border border-gold/25 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-gold/5 mt-8">
        <div>
          <h4 className="font-serif text-base font-semibold text-gold">Save profile changes</h4>
          <p className="text-xs text-leather-dark mt-0.5">
            Save your changes to update your profile immediately.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {saveSuccess && (
            <div className="text-emerald-400 text-xs flex items-center gap-1.5 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/25">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </div>
          )}
          {onCustomizeProfile && (
            <button
              type="button"
              onClick={onCustomizeProfile}
              className="w-full md:w-auto px-6 py-3.5 bg-black border border-gold/30 hover:border-gold hover:bg-gold/5 text-gold text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize Profile</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-gold to-gold-bright text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-gold/15 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {existingProfile && (
        <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-2xl space-y-4 mt-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-red-400">Delete Profile</h4>
              <p className="text-xs text-red-300/80 mt-1">
                Permanently delete your profile. This cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            {showDeleteConfirm ? (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                <span className="text-xs text-red-400 font-bold">Are you sure? This will delete your profile and cannot be undone.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-leather-light rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Delete Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            )}
          </div>
        </div>
      )}

    </form>
  );
}
