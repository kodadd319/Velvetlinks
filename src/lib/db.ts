import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { EscortProfile, Message, BlockRecord } from '../types';

const PROFILES_COLLECTION = 'escort_profiles';
const MESSAGES_COLLECTION = 'messages';
const BLOCKS_COLLECTION = 'blocks';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed data to populate Firestore if empty, ensuring a premium visual presentation on first load.
const SEED_PROFILES: EscortProfile[] = [
  {
    id: 'seed_escort_1',
    userId: 'seed_escort_1',
    name: 'Elena Rostova',
    username: 'elena',
    password: 'password',
    description: '',
    shortDescription: 'Sophisticated, elegant, and highly educated companion. Perfect for corporate events, gala dinners, and private conversation.',
    services: ['Executive Companionship', 'Gala Dinner Hosting', 'Private Travel Companion', 'Social Escort'],
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
    ],
    videos: [],
    location: 'Miami, FL',
    coords: { lat: 25.7617, lng: -80.1918 },
    visibilityExpiry: null,
    rate: '',
    age: 26,
    gender: 'Female',
    languages: ['English', 'Russian', 'French'],
    createdAt: new Date().toISOString(),
    views: 142,
    rating: 4.9
  },
  {
    id: 'seed_escort_2',
    userId: 'seed_escort_2',
    name: 'Marcus Sterling',
    username: 'marcus',
    password: 'password',
    description: '',
    shortDescription: 'Polished gentleman companion with a background in professional athletics and classical arts.',
    services: ['VIP Event Hosting', 'Exclusive Travel Companion', 'Fitness & Wellness Escort', 'Private Dinner Companion'],
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
    ],
    videos: [],
    location: 'New York, NY',
    coords: { lat: 40.7128, lng: -74.0060 },
    visibilityExpiry: null,
    rate: '',
    age: 29,
    gender: 'Male',
    languages: ['English', 'Spanish'],
    createdAt: new Date().toISOString(),
    views: 98,
    rating: 5.0
  },
  {
    id: 'seed_escort_3',
    userId: 'seed_escort_3',
    name: 'Sophia Martinez',
    username: 'sophia',
    password: 'password',
    description: '',
    shortDescription: 'Passionate bicultural hostess with an artistic spirit. Creative, playful, and charmingly spontaneous.',
    services: ['Nightlife Companion', 'Art Event Attendant', 'Resort Travel Escort', 'Cozy Weekend Stays'],
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'
    ],
    videos: [],
    location: 'Los Angeles, CA',
    coords: { lat: 34.0522, lng: -118.2437 },
    visibilityExpiry: null,
    rate: '',
    age: 24,
    gender: 'Female',
    languages: ['English', 'Spanish', 'Portuguese'],
    createdAt: new Date().toISOString(),
    views: 215,
    rating: 4.8
  },
  {
    id: 'seed_escort_4',
    userId: 'seed_escort_4',
    name: 'Amara Vance',
    username: 'amara',
    password: 'password',
    description: '',
    shortDescription: 'Enchanting culinary enthusiast, wine lover, and professional model with deep, engaging conversation.',
    services: ['Fine Dining Escort', 'Luxury Cruise Companion', 'Private Dinner Companion', 'Weekend Retreat Partner'],
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
    ],
    videos: [],
    location: 'Chicago, IL',
    coords: { lat: 41.8781, lng: -87.6298 },
    visibilityExpiry: null,
    rate: '',
    age: 27,
    gender: 'Female',
    languages: ['English', 'Italian'],
    createdAt: new Date().toISOString(),
    views: 110,
    rating: 4.9
  }
];

/**
 * Seed database if it's currently empty
 */
export async function seedDatabaseIfEmpty() {
  try {
    const querySnapshot = await getDocs(collection(db, PROFILES_COLLECTION));
    if (querySnapshot.empty) {
      console.log('Database empty. Seeding standard beautiful escort profiles...');
      for (const profile of SEED_PROFILES) {
        await setDoc(doc(db, PROFILES_COLLECTION, profile.id), profile);
      }
    } else {
      // Backfill gender on existing seeded profiles if missing
      querySnapshot.forEach(async (docSnap) => {
        const data = docSnap.data() as EscortProfile;
        const seedMatch = SEED_PROFILES.find(p => p.id === data.id);
        if (seedMatch && !data.gender) {
          await setDoc(doc(db, PROFILES_COLLECTION, data.id), {
            gender: seedMatch.gender
          }, { merge: true });
        }
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PROFILES_COLLECTION);
  }
}

/**
 * Fetch all profiles
 */
export async function getEscortProfiles(): Promise<EscortProfile[]> {
  try {
    await seedDatabaseIfEmpty();
    const querySnapshot = await getDocs(collection(db, PROFILES_COLLECTION));
    const profiles: EscortProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      profiles.push(docSnap.data() as EscortProfile);
    });
    return profiles;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, PROFILES_COLLECTION);
  }
}

/**
 * Save or update a profile
 */
export async function saveEscortProfile(profile: EscortProfile): Promise<void> {
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, profile.id), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PROFILES_COLLECTION}/${profile.id}`);
  }
}

/**
 * Delete an escort profile from the database
 */
export async function deleteEscortProfile(profileId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PROFILES_COLLECTION, profileId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PROFILES_COLLECTION}/${profileId}`);
  }
}

/**
 * Send a message
 */
export async function sendMessage(msg: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
  const timestamp = new Date().toISOString();
  const id = `${msg.senderId}_${msg.receiverId}_${Date.now()}`;
  try {
    const fullMessage: Message = {
      ...msg,
      id,
      timestamp
    };
    await setDoc(doc(db, MESSAGES_COLLECTION, id), fullMessage);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${MESSAGES_COLLECTION}/${id}`);
  }
}

/**
 * Subscribe to messages between two users in real-time
 */
export function subscribeToMessages(
  userIdA: string,
  userIdB: string,
  onUpdate: (messages: Message[]) => void
) {
  // Query all messages involving these two users.
  // Note: To avoid composite index compilation issues in early Firebase steps, we can do client-side filtering 
  // or simple query filtering. Filtering on senderId/receiverId locally is 100% robust and index-free.
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Message;
      if (
        (data.senderId === userIdA && data.receiverId === userIdB) ||
        (data.senderId === userIdB && data.receiverId === userIdA)
      ) {
        messages.push(data);
      }
    });
    onUpdate(messages);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, MESSAGES_COLLECTION);
  });
}

/**
 * Block a client
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const blockId = `${blockerId}_blocks_${blockedId}`;
  try {
    const record: BlockRecord = {
      id: blockId,
      blockerId,
      blockedId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, BLOCKS_COLLECTION, blockId), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${BLOCKS_COLLECTION}/${blockId}`);
  }
}

/**
 * Unblock a client
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const blockId = `${blockerId}_blocks_${blockedId}`;
  try {
    await deleteDoc(doc(db, BLOCKS_COLLECTION, blockId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${BLOCKS_COLLECTION}/${blockId}`);
  }
}

/**
 * Fetch list of blocked records for an escort
 */
export async function getBlockedUsersForEscort(escortId: string): Promise<BlockRecord[]> {
  try {
    const q = query(
      collection(db, BLOCKS_COLLECTION),
      where('blockerId', '==', escortId)
    );
    const snap = await getDocs(q);
    const blocks: BlockRecord[] = [];
    snap.forEach((docSnap) => {
      blocks.push(docSnap.data() as BlockRecord);
    });
    return blocks;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, BLOCKS_COLLECTION);
  }
}

/**
 * Subscribe to all block relations to enforce them dynamically in-app
 */
export function subscribeToBlocks(onUpdate: (blocks: BlockRecord[]) => void) {
  const q = collection(db, BLOCKS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const blocks: BlockRecord[] = [];
    snapshot.forEach((docSnap) => {
      blocks.push(docSnap.data() as BlockRecord);
    });
    onUpdate(blocks);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, BLOCKS_COLLECTION);
  });
}
