const CACHE_DURATION = 1000 * 60 * 5; // 5 mins

export const getCache = (key) => {
  try {
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const parsed = JSON.parse(cached);

    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

export const setCache = (key, data) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
};

export const clearCache = (key) => {
  localStorage.removeItem(key);
};
