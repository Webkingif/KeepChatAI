import { ChatThread, SavedOutput } from '../types/keepchat';
import { INITIAL_CHATS, INITIAL_MESSAGES } from '../data/seedData';
import {
  loadStoredChats,
  saveStoredChats,
  loadStoredMessages,
  saveStoredMessages,
} from './storage';

const DB_NAME = 'keepchat_db';
const DB_VERSION = 1;
const STORE_CHATS = 'chats';
const STORE_MESSAGES = 'messages';
const STORE_META = 'meta';

/**
 * Checks if IndexedDB is available and operable in the current environment
 */
export function isIndexedDBSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Opens or creates the KeepChat IndexedDB instance
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error('IndexedDB is not supported in this browser/environment'));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Chats Object Store
        if (!db.objectStoreNames.contains(STORE_CHATS)) {
          const chatStore = db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
          chatStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          chatStore.createIndex('isPinned', 'isPinned', { unique: false });
          chatStore.createIndex('category', 'category', { unique: false });
        }

        // Messages / Outputs Object Store
        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const msgStore = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
          msgStore.createIndex('chatId', 'chatId', { unique: false });
          msgStore.createIndex('createdAt', 'createdAt', { unique: false });
          msgStore.createIndex('isStarred', 'isStarred', { unique: false });
        }

        // Metadata Store (for migration flags, schema state)
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open KeepChat IndexedDB'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Loads all chat threads from IndexedDB with fallback to localStorage
 */
export async function loadAllChatsFromDB(): Promise<ChatThread[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_CHATS, 'readonly');
      const store = transaction.objectStore(STORE_CHATS);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as ChatThread[];
        resolve(result || []);
      };

      request.onerror = () => {
        console.warn('Failed to load chats from IndexedDB, falling back to localStorage');
        resolve(loadStoredChats());
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using localStorage for chats:', err);
    return loadStoredChats();
  }
}

/**
 * Saves all chats into IndexedDB (bulk replace) with fallback to localStorage
 */
export async function saveAllChatsToDB(chats: ChatThread[]): Promise<void> {
  // Always update localStorage as immediate fallback
  saveStoredChats(chats);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_CHATS, 'readwrite');
      const store = transaction.objectStore(STORE_CHATS);

      // Clear existing records and rewrite current chats
      store.clear();
      chats.forEach((chat) => store.put(chat));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error saving chats to IndexedDB:', err);
  }
}

/**
 * Puts or updates a single chat in IndexedDB
 */
export async function putChatToDB(chat: ChatThread): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_CHATS, 'readwrite');
      const store = transaction.objectStore(STORE_CHATS);
      store.put(chat);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error updating chat in IndexedDB:', err);
  }
}

/**
 * Deletes a chat from IndexedDB
 */
export async function deleteChatFromDB(chatId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_CHATS, STORE_MESSAGES], 'readwrite');
      const chatStore = transaction.objectStore(STORE_CHATS);
      const msgStore = transaction.objectStore(STORE_MESSAGES);

      // Delete chat
      chatStore.delete(chatId);

      // Delete all messages belonging to this chat
      const index = msgStore.index('chatId');
      const request = index.openCursor(IDBKeyRange.only(chatId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error deleting chat from IndexedDB:', err);
  }
}

/**
 * Loads all messages from IndexedDB with fallback to localStorage
 */
export async function loadAllMessagesFromDB(): Promise<SavedOutput[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_MESSAGES, 'readonly');
      const store = transaction.objectStore(STORE_MESSAGES);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as SavedOutput[];
        resolve(result || []);
      };

      request.onerror = () => {
        console.warn('Failed to load messages from IndexedDB, falling back to localStorage');
        resolve(loadStoredMessages());
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using localStorage for messages:', err);
    return loadStoredMessages();
  }
}

/**
 * Saves all messages into IndexedDB with fallback to localStorage
 */
export async function saveAllMessagesToDB(messages: SavedOutput[]): Promise<void> {
  // Always update localStorage as immediate fallback
  saveStoredMessages(messages);

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = transaction.objectStore(STORE_MESSAGES);

      store.clear();
      messages.forEach((msg) => store.put(msg));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error saving messages to IndexedDB:', err);
  }
}

/**
 * Puts or updates a single output message in IndexedDB
 */
export async function putMessageToDB(message: SavedOutput): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = transaction.objectStore(STORE_MESSAGES);
      store.put(message);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error saving output message to IndexedDB:', err);
  }
}

/**
 * Deletes a single output message from IndexedDB
 */
export async function deleteMessageFromDB(messageId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = transaction.objectStore(STORE_MESSAGES);
      store.delete(messageId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error deleting message from IndexedDB:', err);
  }
}

/**
 * Resets IndexedDB to initial sample seed chats and outputs
 */
export async function resetDBToSamples(): Promise<{
  chats: ChatThread[];
  messages: SavedOutput[];
}> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_CHATS, STORE_MESSAGES], 'readwrite');
      const chatStore = transaction.objectStore(STORE_CHATS);
      const msgStore = transaction.objectStore(STORE_MESSAGES);

      chatStore.clear();
      msgStore.clear();

      INITIAL_CHATS.forEach((chat) => chatStore.put(chat));
      INITIAL_MESSAGES.forEach((msg) => msgStore.put(msg));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Error resetting IndexedDB to samples:', err);
  }

  // Also update localStorage fallback
  saveStoredChats(INITIAL_CHATS);
  saveStoredMessages(INITIAL_MESSAGES);

  return {
    chats: INITIAL_CHATS,
    messages: INITIAL_MESSAGES,
  };
}

/**
 * Initializes the KeepChat database:
 * 1. Checks if IndexedDB is available.
 * 2. If available, checks if migration from localStorage is needed.
 * 3. Migrates existing localStorage chats and outputs into IndexedDB.
 * 4. If neither IndexedDB nor localStorage has data, seeds with INITIAL_CHATS & INITIAL_MESSAGES.
 * 5. Returns { chats, messages } ready for immediate use.
 */
export async function initializeKeepChatDB(): Promise<{
  chats: ChatThread[];
  messages: SavedOutput[];
}> {
  if (!isIndexedDBSupported()) {
    console.log('IndexedDB is not supported. Running on localStorage fallback.');
    return {
      chats: loadStoredChats(),
      messages: loadStoredMessages(),
    };
  }

  try {
    const db = await openDatabase();

    // Check if migration has already occurred
    const isMigrated = await new Promise<boolean>((resolve) => {
      const transaction = db.transaction(STORE_META, 'readonly');
      const metaStore = transaction.objectStore(STORE_META);
      const req = metaStore.get('migrated_from_localstorage');

      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });

    let currentChats = await loadAllChatsFromDB();
    let currentMessages = await loadAllMessagesFromDB();

    // If not yet migrated, check if localStorage has user data
    if (!isMigrated) {
      const localChats = loadStoredChats();
      const localMessages = loadStoredMessages();

      const hasLocalData = localChats.length > 0 || localMessages.length > 0;

      if (hasLocalData && currentChats.length === 0) {
        console.log('Migrating existing localStorage chats & messages into IndexedDB...');
        await saveAllChatsToDB(localChats);
        await saveAllMessagesToDB(localMessages);
        currentChats = localChats;
        currentMessages = localMessages;
      }

      // Mark migration flag in meta store
      try {
        const trans = db.transaction(STORE_META, 'readwrite');
        trans.objectStore(STORE_META).put({ key: 'migrated_from_localstorage', value: true, timestamp: Date.now() });
      } catch (e) {
        console.warn('Could not write migration flag to meta store:', e);
      }
    }

    // If completely fresh (empty) or only has legacy default sample chats, seed with welcome guide
    const hasLegacySamples =
      currentChats.length > 0 &&
      currentChats.some((c) => c.id === 'chat-1') &&
      !currentChats.some((c) => c.id === 'chat-welcome');

    if (currentChats.length === 0 || hasLegacySamples) {
      console.log('Seeding initial welcome guide samples into IndexedDB...');
      await saveAllChatsToDB(INITIAL_CHATS);
      await saveAllMessagesToDB(INITIAL_MESSAGES);
      currentChats = INITIAL_CHATS;
      currentMessages = INITIAL_MESSAGES;
    }

    return {
      chats: currentChats,
      messages: currentMessages,
    };
  } catch (err) {
    console.warn('Failed to initialize IndexedDB, utilizing localStorage fallback:', err);
    return {
      chats: loadStoredChats(),
      messages: loadStoredMessages(),
    };
  }
}
