import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Search, 
  Sparkles, 
  MessageSquare, 
  UserCheck, 
  Settings, 
  AlertCircle,
  X,
  Map,
  Layers,
  Link2,
  User,
  Lock,
  LogIn,
  LogOut,
  ArrowLeft
} from 'lucide-react';

import { EscortProfile, UserAccount, UserRole } from './types';
import { getEscortProfiles, seedDatabaseIfEmpty } from './lib/db';
import { CITIES_REGISTRY, resolveCityCoords, getDistanceMiles } from './utils/location';

import EscortCard from './components/EscortCard';
import EscortDetailModal from './components/EscortDetailModal';
import UserProfileSetup from './components/UserProfileSetup';
import CustomProfileSetup from './components/CustomProfileSetup';
import ChatBox from './components/ChatBox';

// Pre-defined testing profiles for seamless demo testing
const DEFAULT_CLIENT: UserAccount = {
  id: 'demo_client_john',
  email: 'client@gmail.com',
  name: 'John Doe',
  role: 'client',
  location: 'Miami, FL',
  createdAt: new Date().toISOString()
};

const DEFAULT_ESCORT: UserAccount = {
  id: 'seed_escort_1', // Matches Elena's seeded profile ID in db.ts
  email: 'elena@escorts.com',
  name: 'Elena Rostova',
  role: 'escort',
  location: 'Miami, FL',
  createdAt: new Date().toISOString()
};

export default function App() {
  // Application Roles and Active Test User
  const [activeRole, setActiveRole] = useState<UserRole>('client');
  const [clientPage, setClientPage] = useState<'main' | 'profiles'>('main');
  const [clientUser, setClientUser] = useState<UserAccount>(DEFAULT_CLIENT);
  const [escortUser, setEscortUser] = useState<UserAccount>(DEFAULT_ESCORT);

  // Companion Portal authentication states
  const [loggedInEscortId, setLoggedInEscortId] = useState<string | null>(() => {
    return localStorage.getItem('dc_logged_in_escort_id');
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Directory Profiles state
  const [profiles, setProfiles] = useState<EscortProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Client browsing / Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Miami, FL');
  const [appliedLocation, setAppliedLocation] = useState('Miami, FL');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: 25.7617, lng: -80.1918 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [filterService, setFilterService] = useState('');
  const [filterGender, setFilterGender] = useState('All');

  // Active overlays and modals
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<EscortProfile | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<EscortProfile | null>(null);
  
  // Custom companion profile being managed by the active escort
  const [myEscortProfile, setMyEscortProfile] = useState<EscortProfile | null>(null);

  // Fetch profiles on load
  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      await seedDatabaseIfEmpty();
      const list = await getEscortProfiles();
      setProfiles(list);

      // Match the logged-in escort's profile
      if (loggedInEscortId) {
        const myProfile = list.find(p => p.id === loggedInEscortId);
        if (myProfile) {
          setMyEscortProfile(myProfile);
          setEscortUser({
            id: myProfile.id,
            email: `${myProfile.username || 'escort'}@velvetlinks.com`,
            name: myProfile.name,
            role: 'escort',
            location: myProfile.location,
            createdAt: myProfile.createdAt
          });
        } else {
          // If profile id was not found (maybe cleared or seeded again)
          setMyEscortProfile(null);
        }
      } else {
        setMyEscortProfile(null);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [loggedInEscortId]);

  // Geolocation trigger
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords({ lat: latitude, lng: longitude });
          
          let detectedCity = 'Your GPS Coordinates';
          
          try {
            // Try Nominatim reverse geocoding API to get actual City and State
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              {
                headers: {
                  'Accept-Language': 'en'
                }
              }
            );
            if (response.ok) {
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.city_district || '';
                const state = data.address.state || data.address.region || '';
                if (city) {
                  detectedCity = state ? `${city}, ${state}` : city;
                }
              }
            }
          } catch (error) {
            console.error('Error reverse-geocoding via Nominatim:', error);
          }
          
          // If Nominatim failed or returned default, fall back to finding closest city in static list
          if (detectedCity === 'Your GPS Coordinates') {
            let minDistance = Infinity;
            let closest = CITIES_REGISTRY[0];
            for (const city of CITIES_REGISTRY) {
              const dist = getDistanceMiles(latitude, longitude, city.lat, city.lng);
              if (dist < minDistance) {
                minDistance = dist;
                closest = city;
              }
            }
            detectedCity = closest.name;
          }
          
          setSelectedLocation(detectedCity);
          setAppliedLocation(detectedCity);
          setIsDetectingLocation(false);
          setClientPage('profiles');
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  // Trigger search on manually typed or selected location
  const handleSearchLocation = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearchingLocation(true);
    
    // 1. Try static registry match first
    const resolved = resolveCityCoords(trimmed);
    if (resolved) {
      setSelectedCoords({ lat: resolved.lat, lng: resolved.lng });
      setSelectedLocation(resolved.name);
      setAppliedLocation(resolved.name);
      setIsSearchingLocation(false);
      setClientPage('profiles');
      return;
    }

    // 2. Try Nominatim Geocoding API to resolve custom input coordinates
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setSelectedCoords({ lat, lng: lon });
          
          const displayName = data[0].display_name;
          const parts = displayName.split(',');
          const cityAndState = parts.length >= 2 
            ? `${parts[0].trim()}, ${parts[1].trim()}` 
            : trimmed;
          
          setSelectedLocation(cityAndState);
          setAppliedLocation(cityAndState);
        } else {
          // If no results from Nominatim, apply as text filter anyway
          setAppliedLocation(trimmed);
        }
      } else {
        setAppliedLocation(trimmed);
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setAppliedLocation(trimmed);
    } finally {
      setIsSearchingLocation(false);
      setClientPage('profiles');
    }
  };

  // Filtered escort profiles computed dynamically
  const baseFilteredProfiles = profiles
    .filter(profile => {
      // Exclude current companion's own profile from the client search listings
      if (profile.id === escortUser.id) return false;

      // 2. Filter by search query (services, languages, names)
      const matchesSearch = 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (profile.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        profile.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));

      // 3. Filter by services tag dropdown
      const matchesService = filterService === '' || profile.services.includes(filterService);

      // 4. Filter by gender selector
      const matchesGender = 
        filterGender === 'All' || 
        (profile.gender && profile.gender.toLowerCase() === filterGender.toLowerCase());

      return matchesSearch && matchesService && matchesGender;
    });

  // Filter by matching city name
  const exactLocationProfiles = appliedLocation
    ? baseFilteredProfiles.filter(profile => {
        const queryClean = appliedLocation.trim().toLowerCase();
        const profileClean = profile.location.trim().toLowerCase();
        
        if (profileClean === queryClean) {
          return true;
        }

        const queryParts = queryClean.split(',').map(s => s.trim());
        const profileParts = profileClean.split(',').map(s => s.trim());

        const queryCity = queryParts[0];
        const queryState = queryParts[1];

        const profileCity = profileParts[0];
        const profileState = profileParts[1];

        if (queryCity && queryState) {
          return profileCity === queryCity && profileState === queryState;
        } else if (queryCity) {
          return profileCity === queryCity;
        }
        return false;
      })
    : baseFilteredProfiles;

  const sortProfiles = (list: EscortProfile[]) => {
    return [...list].sort((a, b) => {
      // Sort by nearest distance
      const distA = getDistanceMiles(selectedCoords.lat, selectedCoords.lng, a.coords.lat, a.coords.lng);
      const distB = getDistanceMiles(selectedCoords.lat, selectedCoords.lng, b.coords.lat, b.coords.lng);
      return distA - distB;
    });
  };

  const filteredProfiles = appliedLocation ? sortProfiles(exactLocationProfiles) : sortProfiles(baseFilteredProfiles);

  // Extract all unique services dynamically for the search dropdown filters
  const uniqueServices = Array.from(
    new Set(profiles.flatMap(p => p.services))
  );

  return (
    <div className="min-h-screen bg-velvet-lounge text-leather flex flex-col font-sans selection:bg-gold selection:text-black">
      
      {/* Top Professional Header */}
      <header className="sticky top-0 z-30 bg-mahogany-gloss border-b border-gold/25 py-6 px-4 md:px-8 shadow-lg shadow-black/80">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              setActiveRole('client');
              setClientPage('main');
            }}
            className="flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          >
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wider select-none">
                <span className="neon-sign-purple">Velvet</span>
                <span className="neon-sign-pink ml-1">Links</span>
              </h1>
            </div>
          </div>

          {/* Luxury Role Navigation Panel */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-gold/20">
            <button
              onClick={() => {
                setActiveRole('client');
                setClientPage('main');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeRole === 'client'
                  ? 'bg-gradient-to-r from-gold to-gold-bright text-black shadow-md'
                  : 'text-leather/60 hover:text-leather'
              }`}
            >
              <span>Find Companions</span>
            </button>
            <button
              onClick={() => setActiveRole('escort')}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeRole === 'escort'
                  ? 'bg-gradient-to-r from-gold to-gold-bright text-black shadow-md'
                  : 'text-leather/60 hover:text-leather'
              }`}
            >
              <span>Companion Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeRole === 'client' ? (
            
            clientPage === 'main' ? (
              // MAIN PAGE VIEW
              <motion.div
                key="client-main-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12 max-w-4xl mx-auto py-12"
              >
                {/* Hero introduction */}
                <div className="text-center space-y-3">
                  <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight neon-sign-purple">
                    Find escorts in your area
                  </h2>
                  <p className="text-leather-dark text-sm max-w-lg mx-auto">
                    Search companion profiles in your city. Enter a city name below or choose a popular city to browse.
                  </p>
                </div>

                {/* Location Search Box */}
                <div className="bg-mahogany-gloss neon-border-purple p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gold" />
                      <input
                        type="text"
                        list="main-cities"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchLocation(selectedLocation);
                          }
                        }}
                        placeholder="Type city and state (e.g. Miami, FL)"
                        className="w-full bg-black border border-gold/25 rounded-2xl pl-11 pr-4 py-4 text-sm text-leather focus:outline-none focus:border-gold/50 placeholder-leather-dark/60"
                      />
                      <datalist id="main-cities">
                        {CITIES_REGISTRY.map(city => (
                          <option key={city.name} value={city.name} />
                        ))}
                      </datalist>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="p-4 bg-black hover:bg-gold hover:text-black text-gold rounded-2xl transition-all border border-gold/25 text-sm font-bold shrink-0 cursor-pointer flex items-center justify-center min-w-[50px] min-h-[50px]"
                        title="Detect My Location"
                      >
                        {isDetectingLocation ? (
                          <span className="w-5 h-5 border-2 border-t-transparent border-gold animate-spin rounded-full inline-block"></span>
                        ) : (
                          <Map className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSearchLocation(selectedLocation)}
                        disabled={isSearchingLocation}
                        className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-gold to-gold-bright hover:shadow-lg hover:shadow-gold/15 text-black font-bold rounded-2xl text-sm uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] min-h-[50px] flex items-center justify-center"
                      >
                        {isSearchingLocation ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="pt-4 border-t border-gold/10 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-leather-dark">
                      I am searching for:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Female', 'Male', 'Transgender', 'Non-binary'].map((genderOption) => (
                        <button
                          key={genderOption}
                          onClick={() => setFilterGender(genderOption)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                            filterGender === genderOption
                              ? 'bg-gradient-to-r from-gold to-gold-bright text-black border-gold shadow-md shadow-gold/15'
                              : 'bg-black hover:bg-gold/10 border-gold/20 text-leather/80 hover:text-gold'
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Cities Grid */}
                <div className="space-y-4">
                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-gold">
                    Or Choose a Popular City
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      'Miami, FL',
                      'New York, NY',
                      'Los Angeles, CA',
                      'Las Vegas, NV',
                      'Atlanta, GA',
                      'Chicago, IL',
                      'Houston, TX',
                      'Seattle, WA'
                    ].map((cityName) => (
                      <button
                        key={cityName}
                        onClick={() => {
                          setSelectedLocation(cityName);
                          handleSearchLocation(cityName);
                        }}
                        className="px-4 py-3.5 bg-mahogany-gloss/40 hover:bg-gold/10 border border-gold/15 hover:border-gold/50 text-leather hover:text-gold rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center"
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              // PROFILES PAGE VIEW
              <motion.div
                key="client-profiles-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Back Navigation & Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setClientPage('main')}
                      className="px-4 py-2 bg-black hover:bg-gold/5 border border-gold/30 hover:border-gold text-gold text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Search</span>
                    </button>
                    
                    <h2 className="font-serif text-2xl font-bold text-gold">
                      Companion Profiles in {appliedLocation}
                    </h2>
                  </div>

                  <p className="text-xs text-leather-dark">
                    Showing {filteredProfiles.length} active profiles
                  </p>
                </div>

                {/* Filters Area for Refinement */}
                <div className="bg-mahogany-gloss neon-border-purple p-4 rounded-3xl shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Location quick refiner (allows typing/changing right on the page) */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      <div className="relative flex-1 md:flex-initial">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                        <input
                          type="text"
                          list="profiles-cities"
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSearchLocation(selectedLocation);
                            }
                          }}
                          placeholder="Change city (e.g. Miami, FL)"
                          className="w-full md:w-52 bg-black border border-gold/25 rounded-2xl pl-9 pr-4 py-3 text-xs text-leather focus:outline-none focus:border-gold/50 placeholder-leather-dark/60"
                        />
                        <datalist id="profiles-cities">
                          {CITIES_REGISTRY.map(city => (
                            <option key={city.name} value={city.name} />
                          ))}
                        </datalist>
                      </div>

                      <button
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="p-3 bg-black hover:bg-gold hover:text-black text-gold rounded-2xl transition-all border border-gold/25 text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center min-w-[42px] min-h-[42px]"
                        title="Detect My Location"
                      >
                        {isDetectingLocation ? (
                          <span className="w-4 h-4 border-2 border-t-transparent border-gold animate-spin rounded-full inline-block"></span>
                        ) : (
                          <Map className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSearchLocation(selectedLocation)}
                        disabled={isSearchingLocation}
                        className="px-4 py-3 bg-black hover:bg-gold hover:text-black text-gold hover:shadow-lg hover:shadow-gold/15 border border-gold/25 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] shrink-0 min-h-[42px] flex items-center justify-center"
                      >
                        {isSearchingLocation ? '...' : 'Enter'}
                      </button>
                    </div>

                    {/* Refinement Query input (name, services, language) */}
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-dark" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Refine by name, service, or language..."
                        className="w-full bg-black border border-gold/25 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold/50 text-leather placeholder-leather-dark"
                      />
                    </div>
                  </div>

                  {/* Gender Selector for Refinement */}
                  <div className="pt-3 border-t border-gold/10 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-leather-dark">
                      Refine Gender:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Female', 'Male', 'Transgender', 'Non-binary'].map((genderOption) => (
                        <button
                          key={genderOption}
                          onClick={() => setFilterGender(genderOption)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                            filterGender === genderOption
                              ? 'bg-gradient-to-r from-gold to-gold-bright text-black border-gold shadow-sm shadow-gold/10'
                              : 'bg-black hover:bg-gold/10 border-gold/20 text-leather/80 hover:text-gold'
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profiles Listings Grid */}
                {isLoading ? (
                  <div className="py-24 text-center">
                    <div className="inline-block relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-gold/10"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-t-gold animate-spin"></div>
                    </div>
                    <p className="text-leather-dark text-xs mt-3">Loading companion listings...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {filteredProfiles.length === 0 && (
                      <div className="col-span-full py-12 text-center text-leather-dark text-sm bg-mahogany-gloss/30 rounded-2xl border border-gold/10">
                        No companion profiles found in this city. Try another search.
                      </div>
                    )}

                    {filteredProfiles.map((profile) => (
                      <EscortCard
                        key={profile.id}
                        profile={profile}
                        currentCoords={selectedCoords}
                        onSelect={(p) => setSelectedDetailProfile(p)}
                        onStartChat={(p) => setActiveChatPartner(p)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )
          ) : (
            
            // COMPANION PORTAL (ESCORT SETTINGS VIEW)
            <motion.div
              key="escort-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loggedInEscortId !== null ? (
                // LOGGED-IN VIEW: MANAGE PROFILE
                <div className="space-y-6">
                  {isCustomizing && myEscortProfile ? (
                    <CustomProfileSetup
                      profile={myEscortProfile}
                      onBack={() => setIsCustomizing(false)}
                      onProfileUpdated={(updated) => {
                        setMyEscortProfile(updated);
                        loadProfiles();
                      }}
                    />
                  ) : (
                    <>
                      <div className="border-b border-gold/15 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-serif text-3xl font-bold text-gold">Companion Portal</h2>
                            <span className="text-xs bg-gold/10 border border-gold/25 px-2.5 py-1 rounded-full text-gold font-mono font-bold uppercase tracking-wider">
                              Logged In
                            </span>
                          </div>
                          <p className="text-leather-dark text-xs mt-1">
                            Managing profile for <strong className="text-leather">{escortUser.name || 'Anonymous'}</strong> ({escortUser.email})
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            localStorage.removeItem('dc_logged_in_escort_id');
                            setLoggedInEscortId(null);
                            setMyEscortProfile(null);
                            setIsCustomizing(false);
                          }}
                          className="px-4 py-2 bg-black border border-red-500/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out Portal</span>
                        </button>
                      </div>

                      <UserProfileSetup
                        currentUser={escortUser}
                        existingProfile={myEscortProfile}
                        onCustomizeProfile={() => setIsCustomizing(true)}
                        onProfileUpdated={(updated) => {
                          setMyEscortProfile(updated);
                          // Sync escort user info in state
                          setEscortUser({
                            id: updated.id,
                            email: `${updated.username || 'escort'}@velvetlinks.com`,
                            name: updated.name,
                            role: 'escort',
                            location: updated.location,
                            createdAt: updated.createdAt
                          });
                          loadProfiles();
                        }}
                        onProfileDeleted={() => {
                          localStorage.removeItem('dc_logged_in_escort_id');
                          setLoggedInEscortId(null);
                          setMyEscortProfile(null);
                          setIsCustomizing(false);
                          loadProfiles();
                        }}
                      />
                    </>
                  )}
                </div>
              ) : isRegistering ? (
                // REGISTRATION VIEW: CREATE BRAND NEW PROFILE
                <div className="space-y-6">
                  <div className="border-b border-gold/15 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-gold">Register New Profile</h2>
                      <p className="text-leather-dark text-xs mt-1">
                        Register your username, password, display name, and details to list on the platform.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsRegistering(false);
                        setLoginError(null);
                      }}
                      className="px-4 py-2 bg-black border border-gold/20 hover:border-gold text-gold text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Login</span>
                    </button>
                  </div>

                  <UserProfileSetup
                    currentUser={{
                      id: `escort_${Date.now()}`,
                      email: 'new_escort@velvetlinks.com',
                      name: '',
                      role: 'escort',
                      location: 'Miami, FL',
                      createdAt: new Date().toISOString()
                    }}
                    existingProfile={null}
                    onProfileUpdated={(updated) => {
                      // Save completed! Log them in instantly
                      localStorage.setItem('dc_logged_in_escort_id', updated.id);
                      setLoggedInEscortId(updated.id);
                      setMyEscortProfile(updated);
                      setEscortUser({
                        id: updated.id,
                        email: `${updated.username || 'escort'}@velvetlinks.com`,
                        name: updated.name,
                        role: 'escort',
                        location: updated.location,
                        createdAt: updated.createdAt
                      });
                      setIsRegistering(false);
                      loadProfiles();
                    }}
                  />
                </div>
              ) : (
                 // LOGIN VIEW
                <div className="max-w-md mx-auto py-8">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-mahogany-gloss border border-gold/25 rounded-3xl p-8 shadow-2xl space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <div className="inline-flex p-3 bg-gold/10 border border-gold/20 rounded-full mb-1">
                        <LogIn className="w-6 h-6 text-gold animate-gold-pulse" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-gold tracking-tight">Companion Login</h3>
                      <p className="text-leather-dark text-xs">
                        Enter your login details to manage your profile.
                      </p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setLoginError(null);
                        
                        const foundProfile = profiles.find(
                          p => p.username?.toLowerCase() === loginUsername.trim().toLowerCase() && 
                               p.password === loginPassword
                        );

                        if (foundProfile) {
                          localStorage.setItem('dc_logged_in_escort_id', foundProfile.id);
                          setLoggedInEscortId(foundProfile.id);
                          setMyEscortProfile(foundProfile);
                          setEscortUser({
                            id: foundProfile.id,
                            email: `${foundProfile.username || 'escort'}@velvetlinks.com`,
                            name: foundProfile.name,
                            role: 'escort',
                            location: foundProfile.location,
                            createdAt: foundProfile.createdAt
                          });
                          setIsRegistering(false);
                          setLoginUsername('');
                          setLoginPassword('');
                        } else {
                          setLoginError('Invalid username or password. Try "elena" / "password".');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] text-leather-dark font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-gold/60" />
                          <span>Username</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="e.g. elena"
                          className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-leather-dark font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-gold/60" />
                          <span>Password</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black border border-gold/20 rounded-xl px-3.5 py-2.5 text-sm text-leather focus:outline-none focus:border-gold/50"
                        />
                      </div>

                      {loginError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-gold to-gold-bright hover:shadow-lg hover:shadow-gold/15 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] mt-2"
                      >
                        Log In
                      </button>
                    </form>

                    <div className="border-t border-gold/10 pt-4 text-center">
                      <p className="text-xs text-leather-dark">
                        No profile yet?
                      </p>
                      <button
                        onClick={() => {
                          setIsRegistering(true);
                          setLoginError(null);
                        }}
                        className="text-xs text-gold hover:text-gold-bright font-semibold mt-1 hover:underline cursor-pointer"
                      >
                        Register here &rarr;
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating active chat window in Bottom Right */}
      <AnimatePresence>
        {activeChatPartner && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col md:flex-initial">
            <ChatBox
              currentUser={activeRole === 'client' ? clientUser : escortUser}
              partnerId={activeChatPartner.id}
              partnerName={activeChatPartner.name}
              partnerRole={activeRole === 'client' ? 'escort' : 'client'}
              onClose={() => setActiveChatPartner(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Full screen Detail modal */}
      {selectedDetailProfile && (
        <EscortDetailModal
          isOpen={!!selectedDetailProfile}
          profile={selectedDetailProfile}
          onClose={() => setSelectedDetailProfile(null)}
          currentCoords={selectedCoords}
          onStartChat={(p) => setActiveChatPartner(p)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gold/20 py-8 mt-12 bg-black text-center text-leather-dark text-xs space-y-2">
        <p className="font-medium text-leather">© 2026 VelvetLinks Platform. Built for premium companionship.</p>
        <p className="text-[10px] text-leather-dark/80 max-w-md mx-auto">
          All companions listed are independent contractors. Users must be 18 years or older to browse profiles or utilize secure messaging services.
        </p>
      </footer>

    </div>
  );
}
