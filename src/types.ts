export type UserRole = 'escort' | 'client';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  location: string;
  createdAt: string;
}

export interface EscortProfile {
  id: string; // matches the escort's userId
  userId: string;
  name: string;
  description: string;
  services: string[];
  images: string[]; // Base64 dataURIs or default URLs
  videos: string[]; // Base64 or video dataURIs/URLs
  location: string; // Name of location (e.g., "Miami, FL")
  coords: {
    lat: number;
    lng: number;
  };
  visibilityExpiry: string | null; // ISO Date string (if null, profile is draft or expired)
  rate: string; // e.g., "$150/hr" or "$200/session"
  age: number;
  gender?: string;
  languages: string[];
  phone?: string;
  whatsapp?: string;
  username?: string;
  password?: string;
  shortDescription?: string;
  availabilityDays?: string;
  availabilityHours?: string;
  restrictions?: string;
  mainImage?: string;
  gallery?: string[];
  createdAt: string;
  views: number;
  rating: number;
  customTheme?: string;
  customLayout?: string;
  customBg?: string;
  customContactBtn?: string;
  customSocialX?: string;
  customSocialInsta?: string;
  customWebsite?: string;
  qaIdealDate?: string;
  qaExpect?: string;
  customMainFontColor?: string;
  customSecFontColor?: string;
  customBackdrop?: 'black' | 'white';
  customMainColorType?: 'color' | 'pattern';
  customMainColorValue?: string;
  customAccentColor?: string;
  customFont?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  text: string;
  timestamp: string; // ISO string for local comparison
}

export interface BlockRecord {
  id: string;
  blockerId: string; // Escort's ID
  blockedId: string; // Client's ID
  createdAt: string;
}

export interface SubscriptionOption {
  id: 'week' | 'month';
  name: string;
  durationDays: number;
  price: number;
}

export const SUBSCRIPTION_OPTIONS: SubscriptionOption[] = [
  { id: 'week', name: '1 Week Premium Visibility', durationDays: 7, price: 10 },
  { id: 'month', name: '30 Days Premium Visibility', durationDays: 30, price: 25 },
];
