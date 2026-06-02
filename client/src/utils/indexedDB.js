// --- IndexedDB local image caching helper ---

const DB_NAME = 'DuelVerseCache';
const DB_VERSION = 1;
const STORE_NAME = 'card_images';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

/**
 * Checks if the image is in cache, otherwise fetches and caches it.
 * Returns a local Object URL (blob:...) that can be bound directly to img src.
 */
export async function getCachedCardImage(imageUrl) {
  if (!imageUrl) return '';

  try {
    const db = await getDB();
    
    // 1. Try to read from IndexedDB
    const blob = await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(imageUrl);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (blob) {
      // Return local URL pointing to the cached Blob
      return URL.createObjectURL(blob);
    }

    // 2. Not in cache: fetch it from network
    // Using CORS-friendly request
    const response = await fetch(imageUrl, { mode: 'cors', cache: 'default' });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const fetchedBlob = await response.blob();

    // 3. Write Blob to IndexedDB
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(fetchedBlob, imageUrl);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return URL.createObjectURL(fetchedBlob);

  } catch (error) {
    // If cache fails, fall back to the original network URL
    console.warn(`IndexedDB cache failed for ${imageUrl}:`, error);
    return imageUrl;
  }
}

/**
 * Clear cached images
 */
export async function clearImageCache() {
  try {
    const db = await getDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    console.log('IndexedDB card cache cleared successfully.');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}
