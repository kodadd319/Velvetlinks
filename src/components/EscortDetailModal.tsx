import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Star, 
  X, 
  MessageSquare, 
  Compass, 
  Globe, 
  Clock, 
  Calendar,
  Info,
  Twitter,
  Instagram,
  ExternalLink,
  Heart,
  Grid,
  Columns,
  Maximize2,
  FileText,
  CreditCard,
  Layers
} from 'lucide-react';
import { EscortProfile } from '../types';
import { getDistanceMiles } from '../utils/location';
import { getPatternBackgroundStyle } from './CustomProfileSetup';

export const FONT_MAP: Record<string, { family: string; url?: string }> = {
  inter: { family: '"Inter", sans-serif' },
  space_grotesk: { family: '"Space Grotesk", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
  playfair: { family: '"Playfair Display", serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap' },
  cinzel: { family: '"Cinzel", serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap' },
  cormorant: { family: '"Cormorant Garamond", serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap' },
  syne: { family: '"Syne", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&display=swap' },
  outfit: { family: '"Outfit", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' },
  jetbrains_mono: { family: '"JetBrains Mono", monospace', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap' },
  montserrat: { family: '"Montserrat", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap' },
  lora: { family: '"Lora", serif', url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap' },
};

interface EscortDetailModalProps {
  profile: EscortProfile;
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { lat: number; lng: number } | null;
  onStartChat: (profile: EscortProfile) => void;
}

export default function EscortDetailModal({ profile, isOpen, onClose, currentCoords, onStartChat }: EscortDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen) return null;

  // Resolve visual options with fallbacks to preserve backwards compatibility and beautiful default experiences
  const customLayout = profile.customLayout || 'classic';
  const customMainFontColor = profile.customMainFontColor || '#FFFFFF';
  const customSecFontColor = profile.customSecFontColor || '#9CA3AF';
  const customBackdrop = profile.customBackdrop || 'black';
  const customMainColorType = profile.customMainColorType || 'color';
  const customMainColorValue = profile.customMainColorValue || '#0a0a0a';
  const customAccentColor = profile.customAccentColor || '#D4AF37';
  const customFont = profile.customFont || 'inter';
  const selectedFontData = FONT_MAP[customFont] || FONT_MAP.inter;

  const distance = currentCoords && profile.coords
    ? getDistanceMiles(currentCoords.lat, currentCoords.lng, profile.coords.lat, profile.coords.lng)
    : null;

  // Resolve all media items (Main + Gallery fallbacks)
  const mediaList = [
    ...(profile.mainImage ? [profile.mainImage] : []),
    ...(profile.gallery && profile.gallery.length > 0 ? profile.gallery : (profile.images || []))
  ].filter(Boolean);

  const isVideo = (url: string) => {
    return url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.endsWith('.ogg');
  };

  // Get background style based on color or pattern preference
  const getModalBgStyle = () => {
    if (customMainColorType === 'pattern') {
      return getPatternBackgroundStyle(customMainColorValue);
    }
    return { backgroundColor: customMainColorValue };
  };

  // Shared Sub-component: Gallery Slider
  const renderGallerySlider = (customHeightClass = "aspect-[4/5] md:h-full") => (
    <div className={`relative ${customHeightClass} bg-neutral-950 flex flex-col justify-between overflow-hidden group`}>
      {mediaList.length > 0 ? (
        isVideo(mediaList[activeImageIndex]) ? (
          <video
            src={mediaList[activeImageIndex]}
            controls
            className="w-full h-full object-cover transition-all"
          />
        ) : (
          <img
            src={mediaList[activeImageIndex]}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all"
          />
        )
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-leather-dark min-h-[300px]">
          <Compass className="w-12 h-12 mb-2 animate-spin-slow" style={{ color: customAccentColor }} />
          <span className="text-xs font-mono uppercase tracking-widest">Awaiting Media</span>
        </div>
      )}

      {/* Slider dots indicator */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/75 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor: activeImageIndex === idx ? customAccentColor : 'rgba(255,255,255,0.3)',
                width: activeImageIndex === idx ? '16px' : '8px'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Shared Sub-component: General Title Header block
  const renderHeaderBlock = () => (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="font-serif text-3xl font-bold tracking-tight" style={{ color: customMainFontColor }}>
          {profile.name}
        </h2>
        {profile.age ? (
          <span className="text-xl font-sans" style={{ color: customSecFontColor }}>({profile.age})</span>
        ) : null}
        {profile.gender && (
          <span 
            className="text-xs border px-2.5 py-0.5 rounded-full font-sans font-medium tracking-wide bg-white/5"
            style={{ color: customAccentColor, borderColor: `${customAccentColor}33` }}
          >
            {profile.gender}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm mt-2.5 mb-2" style={{ color: customMainFontColor }}>
        {profile.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" style={{ color: customAccentColor }} />
            <span>{profile.location}</span>
            {distance !== null && (
              <span className="font-semibold" style={{ color: customAccentColor }}>({distance} miles)</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-current" style={{ color: customAccentColor }} />
          <span className="font-semibold">{profile.rating?.toFixed(1) || '5.0'}</span>
        </div>
      </div>

      {profile.shortDescription && (
        <p className="text-xs italic font-sans border-l-2 pl-2.5 my-3" style={{ color: customSecFontColor, borderColor: `${customAccentColor}55` }}>
          "{profile.shortDescription}"
        </p>
      )}
    </div>
  );

  // Shared Sub-component: Bottom Action CTA button
  const renderCTAButton = () => (
    <div className="pt-6 border-t border-white/10 flex gap-3">
      <button
        onClick={() => {
          onStartChat(profile);
          onClose();
        }}
        className="flex-1 hover:shadow-lg active:scale-[0.98] text-black font-bold rounded-2xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${customAccentColor} 0%, ${customAccentColor}dd 100%)`,
          boxShadow: `0 4px 14px ${customAccentColor}22`
        }}
      >
        <MessageSquare className="w-4 h-4 text-black" />
        <span>{profile.customContactBtn || 'Message'}</span>
      </button>
    </div>
  );

  // Shared Sub-component: Services & Badges
  const renderServices = () => (
    profile.services && profile.services.length > 0 && (
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: customAccentColor }}>Services & Specialties</span>
        <div className="flex flex-wrap gap-1.5">
          {profile.services.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-xl bg-white/5 border border-white/5"
              style={{ color: customMainFontColor }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  );

  // Shared Sub-component: Hours & Calendar Availability
  const renderAvailability = () => (
    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 flex items-center gap-1" style={{ color: customAccentColor }}>
          <Calendar className="w-3 h-3" />
          <span>Days</span>
        </span>
        <span className="text-xs font-mono" style={{ color: customMainFontColor }}>{profile.availabilityDays || 'Monday - Sunday'}</span>
      </div>
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 flex items-center gap-1" style={{ color: customAccentColor }}>
          <Clock className="w-3 h-3" />
          <span>Hours</span>
        </span>
        <span className="text-xs font-mono" style={{ color: customMainFontColor }}>{profile.availabilityHours || '24/7 Available'}</span>
      </div>
    </div>
  );

  // Shared Sub-component: Interactive Q&A widgets
  const renderQAWidgets = () => (
    <div className="space-y-4">
      {profile.qaIdealDate && (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1" style={{ color: customAccentColor }}>
            <Heart className="w-3 h-3" />
            <span>Ideal Rendezvous</span>
          </span>
          <p className="text-xs leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 italic" style={{ color: customMainFontColor }}>
            "{profile.qaIdealDate}"
          </p>
        </div>
      )}

      {profile.qaExpect && (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1" style={{ color: customAccentColor }}>
            <Info className="w-3 h-3" />
            <span>What to Expect</span>
          </span>
          <p className="text-xs leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5" style={{ color: customMainFontColor }}>
            {profile.qaExpect}
          </p>
        </div>
      )}

      {profile.restrictions && (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1" style={{ color: customAccentColor }}>
            <Info className="w-3 h-3" />
            <span>Extra Requirements</span>
          </span>
          <p className="text-xs leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 whitespace-pre-wrap" style={{ color: customMainFontColor }}>
            {profile.restrictions}
          </p>
        </div>
      )}
    </div>
  );

  // Shared Sub-component: Languages
  const renderLanguages = () => (
    <div className="space-y-2 border-t border-white/5 pt-4">
      <span className="text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1.5" style={{ color: customAccentColor }}>
        <Globe className="w-3.5 h-3.5" />
        <span>Languages Spoken</span>
      </span>
      <div className="flex flex-wrap gap-2 text-xs" style={{ color: customMainFontColor }}>
        {profile.languages?.join(', ') || 'English'}
      </div>
    </div>
  );

  // Shared Sub-component: Social Verification & personal websites
  const renderSocialLinks = () => (
    (profile.customSocialX || profile.customSocialInsta || profile.customWebsite) && (
      <div className="border-t border-white/5 pt-4 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: customAccentColor }}>Verification & Links</span>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {profile.customSocialX && (
            <a 
              href={`https://x.com/${profile.customSocialX}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              style={{ color: customSecFontColor }}
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>@{profile.customSocialX}</span>
            </a>
          )}
          {profile.customSocialInsta && (
            <a 
              href={`https://instagram.com/${profile.customSocialInsta}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              style={{ color: customSecFontColor }}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@{profile.customSocialInsta}</span>
            </a>
          )}
          {profile.customWebsite && (
            <a 
              href={profile.customWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline font-semibold"
              style={{ color: customAccentColor }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    )
  );

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          backgroundColor: customBackdrop === 'white' ? 'rgba(245, 245, 245, 0.96)' : 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)',
          fontFamily: selectedFontData.family
        }}
      >
        {selectedFontData.url && (
          <link rel="stylesheet" href={selectedFontData.url} />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl border rounded-3xl overflow-hidden shadow-2xl my-8 transition-all duration-300"
          style={{
            ...getModalBgStyle(),
            borderColor: `${customAccentColor}33`,
            color: customMainFontColor,
            fontFamily: selectedFontData.family
          }}
        >
          {/* Top Close Button Overlay */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full border bg-black/85 transition-colors cursor-pointer"
            style={{
              color: customMainFontColor,
              borderColor: `${customAccentColor}33`,
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* DYNAMIC RENDERING FOR THE 6 ADVANCED LAYOUT OPTIONS */}

          {customLayout === 'classic' && (
            /* Layout Option 1: Classic Split-Pane layout */
            <div className="grid grid-cols-1 md:grid-cols-2">
              {renderGallerySlider("aspect-[4/5] md:h-[650px]")}
              <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[650px] space-y-6">
                <div className="space-y-6">
                  {renderHeaderBlock()}
                  {renderServices()}
                  {renderAvailability()}
                  {renderQAWidgets()}
                  {renderLanguages()}
                  {renderSocialLinks()}
                </div>
                {renderCTAButton()}
              </div>
            </div>
          )}

          {customLayout === 'bento' && (
            /* Layout Option 2: Bento Box Grid structure */
            <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh] space-y-6">
              {renderHeaderBlock()}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Visual Media spanning 2 cols */}
                <div className="md:col-span-2 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  {renderGallerySlider("aspect-[16/10]")}
                </div>

                {/* Sub Stats Bento block */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block mb-3" style={{ color: customAccentColor }}>Vital Metrics</span>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span style={{ color: customSecFontColor }}>Age</span>
                        <span className="font-bold">{profile.age} yrs</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span style={{ color: customSecFontColor }}>Gender</span>
                        <span className="font-bold">{profile.gender || 'Female'}</span>
                      </div>
                    </div>
                  </div>
                  {renderAvailability()}
                </div>

                {/* Services Grid box */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                  {renderServices()}
                </div>

                {/* Languages & Social links bento */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4">
                  {renderLanguages()}
                  {renderSocialLinks()}
                </div>

                {/* Premium Ideal Rendezvous Q&A card */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider block mb-2 flex items-center gap-1" style={{ color: customAccentColor }}>
                    <Heart className="w-3.5 h-3.5" />
                    <span>Ideal Rendezvous</span>
                  </span>
                  <p className="text-xs leading-relaxed italic" style={{ color: customMainFontColor }}>
                    "{profile.qaIdealDate || 'Discretion, wonderful company, and memorable times...'}"
                  </p>
                </div>
              </div>

              {renderQAWidgets()}
              {renderCTAButton()}
            </div>
          )}

          {customLayout === 'editorial' && (
            /* Layout Option 3: Editorial Minimalist presentation */
            <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh] space-y-10">
              <div className="border-b border-white/10 pb-6 text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: customAccentColor }}>Exclusive Feature Profile</span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight" style={{ color: customMainFontColor }}>{profile.name}</h1>
                <p className="text-sm font-sans tracking-wide italic" style={{ color: customSecFontColor }}>
                  "{profile.shortDescription || 'An experience defined by presence and style.'}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  {renderGallerySlider("aspect-[3/4] rounded-2xl border border-white/10")}
                  {renderSocialLinks()}
                </div>
                
                <div className="space-y-8 font-serif leading-relaxed">
                  <div className="border-b border-white/5 pb-4">
                    <p className="text-[10px] font-sans uppercase font-bold tracking-wider mb-2" style={{ color: customAccentColor }}>Couture Narrative</p>
                    <p className="text-sm leading-relaxed" style={{ color: customMainFontColor }}>
                      Elena invites you to step outside the mundane. With a passion for meaningful dialogues, high-fashion style, and beautiful rendezvous, every hour is dedicated to pure luxury.
                    </p>
                  </div>

                  {renderServices()}
                  {renderAvailability()}
                  {renderLanguages()}
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                {renderQAWidgets()}
              </div>

              {renderCTAButton()}
            </div>
          )}

          {customLayout === 'fullscreen' && (
            /* Layout Option 4: Fullscreen Hero Banner with text overlay */
            <div className="relative aspect-[16/10] md:h-[650px] w-full">
              {renderGallerySlider("w-full h-full absolute inset-0 z-0")}
              
              {/* Cinematic bottom card gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-10 flex flex-col justify-end space-y-6 overflow-y-auto max-h-[70%]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-8 space-y-3">
                    {renderHeaderBlock()}
                    {renderServices()}
                  </div>
                  <div className="md:col-span-4 bg-black/60 border border-white/10 backdrop-blur-md p-4 rounded-xl space-y-3">
                    {renderAvailability()}
                    {renderLanguages()}
                    {renderSocialLinks()}
                  </div>
                </div>

                {renderQAWidgets()}
                {renderCTAButton()}
              </div>
            </div>
          )}

          {customLayout === 'dual_column' && (
            /* Layout Option 5: Dual Column Biography */
            <div className="overflow-y-auto max-h-[90vh]">
              {renderGallerySlider("aspect-[21/9] w-full border-b border-white/10")}
              
              <div className="p-6 md:p-8 space-y-6">
                {renderHeaderBlock()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider block border-b border-white/10 pb-1" style={{ color: customAccentColor }}>Services & Specialization</span>
                    {renderServices()}
                    {renderLanguages()}
                    {renderSocialLinks()}
                  </div>
                  
                  <div className="space-y-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider block border-b border-white/10 pb-1" style={{ color: customAccentColor }}>Availability & Rendezvous</span>
                    {renderAvailability()}
                    {renderQAWidgets()}
                  </div>
                </div>

                {renderCTAButton()}
              </div>
            </div>
          )}

          {customLayout === 'compact' && (
            /* Layout Option 6: Compact Visual Card layout */
            <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-md shrink-0" style={{ borderColor: customAccentColor }}>
                  {mediaList.length > 0 ? (
                    <img
                      src={mediaList[0]}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Compass className="w-12 h-12" style={{ color: customAccentColor }} />
                  )}
                </div>
                <div className="flex-1">
                  {renderHeaderBlock()}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4">
                {renderServices()}
                {renderAvailability()}
                {renderLanguages()}
                {renderQAWidgets()}
                {renderSocialLinks()}
              </div>

              {renderCTAButton()}
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
