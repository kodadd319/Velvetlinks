import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Star, MessageSquare, ArrowRight, Globe } from 'lucide-react';
import { EscortProfile } from '../types';
import { getDistanceMiles } from '../utils/location';

interface EscortCardProps {
  key?: string;
  profile: EscortProfile;
  currentCoords: { lat: number; lng: number } | null;
  onSelect: (profile: EscortProfile) => void;
  onStartChat: (profile: EscortProfile) => void;
}

export default function EscortCard({ profile, currentCoords, onSelect, onStartChat }: EscortCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const distance = currentCoords && profile.coords
    ? getDistanceMiles(currentCoords.lat, currentCoords.lng, profile.coords.lat, profile.coords.lng)
    : null;

  // Resolve all media items
  const mediaList = [
    ...(profile.mainImage ? [profile.mainImage] : []),
    ...(profile.gallery && profile.gallery.length > 0 ? profile.gallery : (profile.images || []))
  ].filter(Boolean);

  const isVideo = (url: string) => {
    return url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.endsWith('.ogg');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col velvet-pillow overflow-hidden cursor-pointer"
      onClick={() => onSelect(profile)}
    >
      {/* Profile Image/Video Gallery Container */}
      <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden">
        {mediaList.length > 0 ? (
          isVideo(mediaList[activeImageIndex]) ? (
            <video
              src={mediaList[activeImageIndex]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={mediaList[activeImageIndex]}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#1B1D22] to-[#24262C] text-leather-dark">
            <span className="font-serif text-3xl font-bold mb-1 text-gold">
              {profile.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-xs">No media uploaded</span>
          </div>
        )}

        {/* Media dots navigation */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-gold-bright w-3' : 'bg-leather/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Floating Quick Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif text-xl font-semibold text-white drop-shadow-md">
              {profile.name}
            </span>
            <span className="text-sm text-leather drop-shadow-md font-sans">
              ({profile.age})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-leather">
            <div className="flex items-center gap-1 drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{profile.location}</span>
              {distance !== null && (
                <span className="text-gold-bright font-medium">({distance} miles)</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 drop-shadow-md">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="font-medium text-gold">{profile.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-black/40">
        <div className="space-y-3">
          {/* Tags list */}
          <div className="flex flex-wrap gap-1.5">
            {profile.services.slice(0, 3).map((tag, idx) => {
              const isSlateBlue = idx % 2 === 1;
              return (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                    isSlateBlue 
                      ? 'bg-slate-blue-dark/20 text-slate-blue-light border-slate-blue/30' 
                      : 'bg-mahogany/50 text-leather border-gold/15'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
            {profile.services.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-mahogany/50 text-leather-dark">
                +{profile.services.length - 3}
              </span>
            )}
          </div>

          <p className="text-xs text-leather-dark line-clamp-2 leading-relaxed">
            {profile.shortDescription}
          </p>
        </div>

        <div className="border-t border-gold/15 pt-3.5 mt-4 flex items-center justify-end">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(profile);
              }}
              className="p-2 bg-black hover:bg-slate-blue hover:text-white text-slate-blue rounded-xl transition-all border border-slate-blue/20 cursor-pointer"
              title="Send Direct Message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(profile);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-slate-blue to-slate-blue-light hover:shadow-md hover:shadow-slate-blue/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
