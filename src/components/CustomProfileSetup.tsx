import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Heart, 
  Info, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  MessageSquare, 
  Globe, 
  Twitter, 
  Instagram, 
  ExternalLink,
  BookOpen,
  Eye,
  Type,
  Maximize2,
  Columns,
  Grid,
  FileText,
  CreditCard,
  Layers
} from 'lucide-react';
import { EscortProfile } from '../types';
import { saveEscortProfile } from '../lib/db';
import EscortDetailModal from './EscortDetailModal';

interface CustomProfileSetupProps {
  profile: EscortProfile;
  onBack: () => void;
  onProfileUpdated: (updated: EscortProfile) => void;
}

// Layout options definition
const LAYOUT_OPTIONS = [
  { id: 'classic', name: 'Split Screen', icon: Columns, description: 'Left-side gallery with right-side biography.' },
  { id: 'bento', name: 'Grid Layout', icon: Grid, description: 'Grid boxes to group stats, details, and biography.' },
  { id: 'editorial', name: 'Minimalist Layout', icon: FileText, description: 'Simple layout with bold text and space.' },
  { id: 'fullscreen', name: 'Banner Overlay', icon: Maximize2, description: 'Main background photo with text overlay.' },
  { id: 'dual_column', name: 'Two Columns', icon: Layers, description: 'Double column text layout for the biography.' },
  { id: 'compact', name: 'Compact Card', icon: CreditCard, description: 'Small centered card showing essential details.' },
];

// Presets for main font color
const MAIN_FONT_PRESETS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#E5E7EB' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Ice Blue', hex: '#E0F2FE' },
  { name: 'Green', hex: '#D1FAE5' },
  { name: 'Purple', hex: '#F3E8FF' },
  { name: 'Black', hex: '#111827' },
];

// Presets for secondary font color
const SEC_FONT_PRESETS = [
  { name: 'Sand', hex: '#C2B280' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Charcoal', hex: '#9CA3AF' },
  { name: 'Slate Blue (Light)', hex: '#7091bd' },
  { name: 'Blue', hex: '#93C5FD' },
  { name: 'Sage', hex: '#A7F3D0' },
  { name: 'Dark Gray', hex: '#4B5563' },
];

// Presets for Accent color
const ACCENT_PRESETS = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Orange', hex: '#F59E0B' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Slate Blue', hex: '#4f6f96' },
  { name: 'Slate Blue (Glow)', hex: '#5d81ad' },
];

// Patterns definition with detailed names and visual representations
const PATTERN_OPTIONS = [
  { id: 'green_camo', name: 'Green Camo', description: 'Green camo background' },
  { id: 'urban_camo', name: 'Gray Camo', description: 'Gray camo background' },
  { id: 'carbon_fiber', name: 'Carbon Fiber', description: 'Carbon pattern background' },
  { id: 'light_woodgrain', name: 'Wood Grain', description: 'Light wood background' },
  { id: 'polished_steel', name: 'Brushed Steel', description: 'Brushed steel background' },
  { id: 'liquid_chrome', name: 'Chrome', description: 'Silver pattern background' },
  { id: 'golden_velvet', name: 'Gold Velvet', description: 'Gold velvet background' },
  { id: 'cosmic_nebula', name: 'Space', description: 'Deep space background' },
];

// 5 Premium visual presets
const DESIGN_PRESETS = [
  {
    name: 'Dark Carbon',
    description: 'Dark design with carbon pattern and red accents.',
    config: {
      customLayout: 'bento',
      customMainFontColor: '#FFFFFF',
      customSecFontColor: '#9CA3AF',
      customBackdrop: 'black' as const,
      customMainColorType: 'pattern' as const,
      customMainColorValue: 'carbon_fiber',
      customAccentColor: '#EF4444'
    }
  },
  {
    name: 'Green Camo',
    description: 'Military style with green camo background and orange accents.',
    config: {
      customLayout: 'classic',
      customMainFontColor: '#F3F4F6',
      customSecFontColor: '#C2B280',
      customBackdrop: 'black' as const,
      customMainColorType: 'pattern' as const,
      customMainColorValue: 'green_camo',
      customAccentColor: '#F59E0B'
    }
  },
  {
    name: 'Light Wood',
    description: 'Clean design with wood pattern, white backdrop, and gold accents.',
    config: {
      customLayout: 'editorial',
      customMainFontColor: '#111827',
      customSecFontColor: '#4B5563',
      customBackdrop: 'white' as const,
      customMainColorType: 'pattern' as const,
      customMainColorValue: 'light_woodgrain',
      customAccentColor: '#D4AF37'
    }
  },
  {
    name: 'Liquid Chrome',
    description: 'Silver chrome background with cyan accents.',
    config: {
      customLayout: 'fullscreen',
      customMainFontColor: '#FFFFFF',
      customSecFontColor: '#93C5FD',
      customBackdrop: 'black' as const,
      customMainColorType: 'pattern' as const,
      customMainColorValue: 'liquid_chrome',
      customAccentColor: '#06B6D4'
    }
  },
  {
    name: 'Steel & Slate Blue',
    description: 'Brushed steel background with slate blue highlights.',
    config: {
      customLayout: 'dual_column',
      customMainFontColor: '#FFFFFF',
      customSecFontColor: '#CBD5E1',
      customBackdrop: 'black' as const,
      customMainColorType: 'pattern' as const,
      customMainColorValue: 'polished_steel',
      customAccentColor: '#7091bd'
    }
  }
];

// 10 Premium typography / font options
export const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', desc: 'Clean Sans', family: '"Inter", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { id: 'space_grotesk', name: 'Space Grotesk', desc: 'Modern Display', family: '"Space Grotesk", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
  { id: 'playfair', name: 'Playfair Display', desc: 'Elegant Serif', family: '"Playfair Display", serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap' },
  { id: 'cinzel', name: 'Cinzel', desc: 'Classical Serif', family: '"Cinzel", serif', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap' },
  { id: 'cormorant', name: 'Cormorant Garamond', desc: 'Boutique Serif', family: '"Cormorant Garamond", serif', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap' },
  { id: 'syne', name: 'Syne', desc: 'Artistic Sans', family: '"Syne", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&display=swap' },
  { id: 'outfit', name: 'Outfit', desc: 'Geometric Sans', family: '"Outfit", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' },
  { id: 'jetbrains_mono', name: 'JetBrains Mono', desc: 'Technical Monospace', family: '"JetBrains Mono", monospace', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap' },
  { id: 'montserrat', name: 'Montserrat', desc: 'Classic Sans', family: '"Montserrat", sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap' },
  { id: 'lora', name: 'Lora', desc: 'Contemporary Serif', family: '"Lora", serif', url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap' },
];

// Helper to render patterns as CSS background styles
export const getPatternBackgroundStyle = (patternId: string): React.CSSProperties => {
  switch (patternId) {
    case 'green_camo':
      return {
        backgroundColor: '#1b2413',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, #34401e 15%, transparent 20%),
          radial-gradient(circle at 75% 60%, #4a5c2d 20%, transparent 25%),
          radial-gradient(circle at 40% 80%, #263311 25%, transparent 30%),
          radial-gradient(circle at 80% 20%, #1e280f 18%, transparent 23%)
        `,
        backgroundSize: '120px 120px',
      };
    case 'urban_camo':
      return {
        backgroundColor: '#2b2b2b',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, #444444 15%, transparent 20%),
          radial-gradient(circle at 80% 50%, #666666 22%, transparent 28%),
          radial-gradient(circle at 30% 70%, #1e1e1e 24%, transparent 30%),
          radial-gradient(circle at 70% 85%, #888888 15%, transparent 18%)
        `,
        backgroundSize: '100px 100px',
      };
    case 'carbon_fiber':
      return {
        backgroundColor: '#111111',
        backgroundImage: `
          linear-gradient(45deg, #181818 25%, transparent 25%, transparent 75%, #181818 75%, #181818),
          linear-gradient(45deg, #181818 25%, #111111 25%, #111111 75%, #181818 75%, #181818)
        `,
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0, 6px 6px',
      };
    case 'light_woodgrain':
      return {
        backgroundColor: '#f7f1e3',
        backgroundImage: `
          linear-gradient(90deg, #efe6d0 1px, transparent 1px),
          linear-gradient(180deg, #f5ecd6 2px, transparent 2px),
          repeating-linear-gradient(0deg, #fbf7ed, #fbf7ed 4px, #f4ebda 4px, #f4ebda 8px)
        `,
        backgroundSize: '80px 100px',
      };
    case 'polished_steel':
      return {
        background: 'linear-gradient(135deg, #4b5563 0%, #1e293b 50%, #4b5563 100%)',
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 4px),
          linear-gradient(135deg, #64748b 0%, #334155 50%, #1e293b 100%)
        `,
      };
    case 'liquid_chrome':
      return {
        background: 'linear-gradient(150deg, #d1d5db 0%, #9ca3af 20%, #f3f4f6 40%, #4b5563 60%, #e5e7eb 80%, #374151 100%)',
        boxShadow: 'inset 0 0 40px rgba(255,255,255,0.2)',
      };
    case 'golden_velvet':
      return {
        background: 'linear-gradient(135deg, #855e0f 0%, #d4af37 30%, #e6ca65 50%, #9e781d 75%, #d4af37 100%)',
      };
    case 'cosmic_nebula':
      return {
        backgroundColor: '#0a051b',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)
        `,
      };
    default:
      return {};
  }
};

export default function CustomProfileSetup({ profile, onBack, onProfileUpdated }: CustomProfileSetupProps) {
  // Config States mirroring our new detailed layout specifications
  const [customLayout, setCustomLayout] = useState(profile.customLayout || 'classic');
  const [customMainFontColor, setCustomMainFontColor] = useState(profile.customMainFontColor || '#FFFFFF');
  const [customSecFontColor, setCustomSecFontColor] = useState(profile.customSecFontColor || '#9CA3AF');
  const [customBackdrop, setCustomBackdrop] = useState<'black' | 'white'>(profile.customBackdrop || 'black');
  const [customMainColorType, setCustomMainColorType] = useState<'color' | 'pattern'>(profile.customMainColorType || 'pattern');
  const [customMainColorValue, setCustomMainColorValue] = useState(profile.customMainColorValue || 'carbon_fiber');
  const [customAccentColor, setCustomAccentColor] = useState(profile.customAccentColor || '#D4AF37');
  const [customFont, setCustomFont] = useState(profile.customFont || 'inter');
  const [activeTab, setActiveTab] = useState<'canvas' | 'typography' | 'details'>('canvas');

  // Contact Field options carried over for comprehensive customization
  const [customContactBtn, setCustomContactBtn] = useState(profile.customContactBtn || '');
  const [customSocialX, setCustomSocialX] = useState(profile.customSocialX || '');
  const [customSocialInsta, setCustomSocialInsta] = useState(profile.customSocialInsta || '');
  const [customWebsite, setCustomWebsite] = useState(profile.customWebsite || '');
  const [qaIdealDate, setQaIdealDate] = useState(profile.qaIdealDate || '');
  const [qaExpect, setQaExpect] = useState(profile.qaExpect || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Apply a selected preset
  const applyPreset = (preset: typeof DESIGN_PRESETS[0]) => {
    const { config } = preset;
    setCustomLayout(config.customLayout);
    setCustomMainFontColor(config.customMainFontColor);
    setCustomSecFontColor(config.customSecFontColor);
    setCustomBackdrop(config.customBackdrop);
    setCustomMainColorType(config.customMainColorType);
    setCustomMainColorValue(config.customMainColorValue);
    setCustomAccentColor(config.customAccentColor);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedProfile: EscortProfile = {
        ...profile,
        customLayout,
        customMainFontColor,
        customSecFontColor,
        customBackdrop,
        customMainColorType,
        customMainColorValue,
        customAccentColor,
        customFont,
        customContactBtn,
        customSocialX,
        customSocialInsta,
        customWebsite,
        qaIdealDate,
        qaExpect,
      };

      await saveEscortProfile(updatedProfile);
      onProfileUpdated(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Error saving custom profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Resolve the visual style for the live preview background
  const getPreviewBgStyle = () => {
    if (customMainColorType === 'pattern') {
      return getPatternBackgroundStyle(customMainColorValue);
    }
    return { backgroundColor: customMainColorValue };
  };

  const previewProfile: EscortProfile = {
    ...profile,
    customLayout,
    customMainFontColor,
    customSecFontColor,
    customBackdrop,
    customMainColorType,
    customMainColorValue,
    customAccentColor,
    customFont,
    customContactBtn,
    customSocialX,
    customSocialInsta,
    customWebsite,
    qaIdealDate,
    qaExpect,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold animate-pulse" />
            <h2 className="font-serif text-3xl font-bold text-gold">Custom Profile</h2>
          </div>
          <p className="text-leather-dark text-xs mt-1">
            Choose layout options, colors, backgrounds, and fonts for your profile page.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-black border border-slate-blue/30 hover:border-slate-blue text-slate-blue text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* 1. Preset page designs */}
      <div className="velvet-pillow p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-bright" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Preset Designs</h3>
        </div>
        <p className="text-[11px] text-leather-dark">
          Choose a design to quickly set up your profile style.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 bg-black/60 border border-gold/15 hover:border-gold/50 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between h-28"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                <p className="text-[9px] text-leather-dark mt-1 leading-relaxed line-clamp-3">
                  {preset.description}
                </p>
              </div>
              <span className="text-[9px] text-gold uppercase font-bold tracking-wider block mt-2 text-right">Apply</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* 2. Outer frame backdrop */}
        <div className="velvet-pillow p-6 space-y-4">
          <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <span>Outer Frame Backdrop</span>
          </h3>
          <p className="text-xs text-leather-dark">
            Choose the background color of the page margins.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setCustomBackdrop('black')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                customBackdrop === 'black' 
                  ? 'border-gold bg-black text-white shadow-lg shadow-gold/5' 
                  : 'border-white/10 bg-black/40 text-leather-dark hover:text-leather'
              }`}
            >
              Black
            </button>
            <button
              type="button"
              onClick={() => setCustomBackdrop('white')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                customBackdrop === 'white' 
                  ? 'border-gold bg-white text-black shadow-lg shadow-gold/5' 
                  : 'border-white/10 bg-black/40 text-leather-dark hover:text-leather'
              }`}
            >
              White
            </button>
          </div>
        </div>

        {/* 3. Page layout */}
        <div className="velvet-pillow p-6 space-y-4">
          <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
            <Layout className="w-5 h-5" />
            <span>Page Layout</span>
          </h3>
          <p className="text-xs text-leather-dark">
            Choose how your biography, photos, and information are arranged.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {LAYOUT_OPTIONS.map((layout) => {
              const LayoutIcon = layout.icon;
              const isSelected = customLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setCustomLayout(layout.id)}
                  className={`text-left p-3.5 rounded-xl border flex gap-3 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-gold bg-gold/5 shadow-md shadow-gold/5' 
                      : 'border-gold/10 bg-black/40 hover:border-gold/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-gold/20 text-gold' : 'bg-black text-leather-dark'} self-start`}>
                    <LayoutIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-gold' : 'text-leather'}`}>
                      {layout.name}
                    </h4>
                    <p className="text-[10px] text-leather-dark mt-0.5 leading-relaxed">{layout.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Canvas Backing */}
        <div className="velvet-pillow p-6 space-y-4">
          <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span>Canvas Backing</span>
          </h3>
          <p className="text-xs text-leather-dark">
            Choose if the inner profile background should be a pattern or a solid color.
          </p>
          <div className="flex gap-4 border-b border-gold/10 pb-3">
            <button
              type="button"
              onClick={() => setCustomMainColorType('pattern')}
              className={`text-xs font-bold uppercase tracking-wider pb-1 cursor-pointer transition-colors ${
                customMainColorType === 'pattern' ? 'text-gold border-b-2 border-gold' : 'text-leather-dark hover:text-leather'
              }`}
            >
              Patterns
            </button>
            <button
              type="button"
              onClick={() => setCustomMainColorType('color')}
              className={`text-xs font-bold uppercase tracking-wider pb-1 cursor-pointer transition-colors ${
                customMainColorType === 'color' ? 'text-gold border-b-2 border-gold' : 'text-leather-dark hover:text-leather'
              }`}
            >
              Solid Color
            </button>
          </div>
        </div>

        {/* 5. Font color and typeface */}
        <div className="velvet-pillow p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-gold" />
              <h3 className="font-serif text-lg font-medium text-gold">Fonts and Text Colors</h3>
            </div>
            <p className="text-xs text-leather-dark">
              Select a font style and set custom colors for your text.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {FONT_OPTIONS.map((f) => {
                const isSelected = customFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCustomFont(f.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.01] ${
                      isSelected 
                        ? 'border-gold bg-gold/5 shadow-md shadow-gold/5' 
                        : 'border-gold/10 bg-black/40 hover:border-gold/30'
                    }`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.url && <link rel="stylesheet" href={f.url} />}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-gold' : 'text-leather'}`}>{f.name}</span>
                        <p className="text-[10px] text-leather-dark mt-0.5" style={{ fontFamily: '"Inter", sans-serif' }}>{f.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-gold-bright animate-ping" />
                      )}
                    </div>
                    <div className="mt-3 text-lg leading-none font-bold" style={{ color: isSelected ? customAccentColor : '#ffffff' }}>
                      AbCdEfGh
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gold/10 pt-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold">Text Colors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Font Color */}
              <div className="space-y-3">
                <label className="block text-xs text-leather-light font-bold uppercase tracking-wider">Heading Text Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {MAIN_FONT_PRESETS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setCustomMainFontColor(col.hex)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        customMainFontColor.toLowerCase() === col.hex.toLowerCase() ? 'border-gold ring-2 ring-gold/20 scale-110' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={customMainFontColor.startsWith('#') ? customMainFontColor : '#FFFFFF'}
                    onChange={(e) => setCustomMainFontColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customMainFontColor}
                    onChange={(e) => setCustomMainFontColor(e.target.value)}
                    className="flex-1 bg-black border border-gold/20 rounded-xl px-3 py-1.5 text-xs text-leather focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>

              {/* Secondary Font Color */}
              <div className="space-y-3">
                <label className="block text-xs text-leather-light font-bold uppercase tracking-wider">Body Text Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {SEC_FONT_PRESETS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setCustomSecFontColor(col.hex)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        customSecFontColor.toLowerCase() === col.hex.toLowerCase() ? 'border-gold ring-2 ring-gold/20 scale-110' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={customSecFontColor.startsWith('#') ? customSecFontColor : '#9CA3AF'}
                    onChange={(e) => setCustomSecFontColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customSecFontColor}
                    onChange={(e) => setCustomSecFontColor(e.target.value)}
                    className="flex-1 bg-black border border-gold/20 rounded-xl px-3 py-1.5 text-xs text-leather focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Accent color */}
        <div className="velvet-pillow p-6 space-y-4">
          <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-bright" />
            <span>Accent Color</span>
          </h3>
          <p className="text-xs text-leather-dark">
            Choose a color for badges, buttons, and links.
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setCustomAccentColor(col.hex)}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    customAccentColor.toLowerCase() === col.hex.toLowerCase() ? 'border-gold ring-2 ring-gold/20 scale-110' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="color"
                value={customAccentColor.startsWith('#') ? customAccentColor : '#D4AF37'}
                onChange={(e) => setCustomAccentColor(e.target.value)}
                className="w-8 h-8 bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={customAccentColor}
                onChange={(e) => setCustomAccentColor(e.target.value)}
                className="flex-1 bg-black border border-gold/20 rounded-xl px-3 py-1.5 text-xs text-leather focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>
        </div>

        {/* 7. Canvas backing style */}
        <div className="velvet-pillow p-6 space-y-4">
          <h3 className="font-serif text-lg font-medium text-gold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span>Canvas Backing Style</span>
          </h3>
          <p className="text-xs text-leather-dark">
            Choose your pattern design or pick your solid color below.
          </p>

          {customMainColorType === 'pattern' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {PATTERN_OPTIONS.map((pat) => {
                const isSelected = customMainColorValue === pat.id;
                const patternStyle = getPatternBackgroundStyle(pat.id);
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setCustomMainColorValue(pat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer h-24 flex flex-col justify-between ${
                      isSelected 
                        ? 'border-gold bg-gold/5 shadow-md shadow-gold/5' 
                        : 'border-gold/10 bg-black/40 hover:border-gold/30'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg overflow-hidden border border-white/10" style={patternStyle} />
                    <div>
                      <h4 className={`text-[10px] font-bold ${isSelected ? 'text-gold' : 'text-leather'}`}>{pat.name}</h4>
                      <p className="text-[8px] text-leather-dark line-clamp-1">{pat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-gold/20" style={{ backgroundColor: customMainColorValue }} />
                <div className="flex-1">
                  <label className="block text-xs text-leather-dark font-bold uppercase mb-1">Color Picker</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customMainColorValue.startsWith('#') ? customMainColorValue : '#111111'}
                      onChange={(e) => setCustomMainColorValue(e.target.value)}
                      className="w-10 h-10 bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customMainColorValue}
                      onChange={(e) => setCustomMainColorValue(e.target.value)}
                      className="flex-1 bg-black border border-gold/20 rounded-xl px-3 text-xs text-leather focus:outline-none focus:border-gold/50"
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 8. Commit and preview profile section and buttons */}
        <div className="velvet-pillow p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gold">Save and Preview</h4>
            <p className="text-xs text-leather-dark mt-0.5">Preview your changes or save them to your live profile.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {saveSuccess && (
              <span className="text-emerald-400 text-xs mr-2 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-black hover:bg-slate-blue/10 border border-slate-blue/40 hover:border-slate-blue text-slate-blue text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4.5 h-4.5" />
              <span>Preview</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-slate-blue to-slate-blue-light text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-slate-blue/15 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 font-extrabold"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5 text-black" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Full Screen Live Preview Modal */}
      {isPreviewOpen && (
        <EscortDetailModal
          profile={previewProfile}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          currentCoords={null}
          onStartChat={() => {}}
        />
      )}
    </div>
  );
}
