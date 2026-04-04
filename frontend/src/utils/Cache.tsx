const CACHE_DURATION = 5 * 60 * 1000; // 5 min

export function readLocal(key: string) {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeLocal(key: string, value: string) {
  if (typeof window === "undefined") return null;
  try { localStorage.setItem(key, value); } catch {}
}

export function getCached<T>(key: string): T | null {
  const raw = readLocal(key);
  if (!raw) return null;

  try {
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data as T;
    
    localStorage.removeItem(key);
  } catch { localStorage.removeItem(key); }
  
  return null;
}

export function setCached<T>(key: string, data: T) {
  writeLocal(key, JSON.stringify({ data, timestamp: Date.now() }));
}


export function clearCached(key: string) {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(key); } catch {}
}