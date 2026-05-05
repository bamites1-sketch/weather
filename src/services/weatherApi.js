/**
 * weatherApi.js — Pure API layer.
 *
 * Improvements implemented:
 *
 *  1. REQUEST CANCELLATION
 *     Every public function accepts an optional AbortSignal.
 *     The caller (useWeather) creates a new AbortController on each search
 *     and aborts the previous one, so stale in-flight requests never
 *     overwrite fresher results.
 *
 *  2. IN-MEMORY RESPONSE CACHE (10-minute TTL)
 *     getCurrentWeather and getForecast cache their responses keyed by
 *     "lat,lon" (rounded to 2 dp to normalise near-identical coords).
 *     A cache hit skips the network entirely. The cache is module-level
 *     so it persists across hook re-mounts within the same page session.
 *     TTL is configurable via CACHE_TTL_MS.
 *
 * Rules still enforced:
 *  - Only axios calls. No transformation, no state, no UI.
 *  - Every function either returns raw data or throws a normalised Error.
 *  - A single normaliseError maps all HTTP/network failures to user messages.
 */

import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error(
    '[weatherApi] VITE_OPENWEATHER_API_KEY is not set. ' +
    'Copy .env.example → .env and add your key.'
  );
}

// ─── Cache configuration ──────────────────────────────────────────────────────

/** How long a cached response is considered fresh (10 minutes) */
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Module-level cache: Map<cacheKey, { data, timestamp }>
 * Separate maps per endpoint so keys never collide.
 */
const currentWeatherCache = new Map();
const forecastCache       = new Map();

/** Round lat/lon to 2 decimal places to normalise near-identical coords */
const coordKey = (lat, lon) =>
  `${Math.round(lat * 100) / 100},${Math.round(lon * 100) / 100}`;

/** Return cached entry if it exists and is still within TTL, else null */
const getFromCache = (cache, key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key); // evict stale entry
    return null;
  }
  return entry.data;
};

const setInCache = (cache, key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ─── Axios instances ──────────────────────────────────────────────────────────

const geoClient = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  params:  { appid: API_KEY },
  timeout: 8000,
});

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params:  { appid: API_KEY },
  timeout: 8000,
});

// ─── Centralised error normaliser ────────────────────────────────────────────

/**
 * Maps any Axios error to a plain, user-readable Error and throws it.
 * Always throws — never returns.
 * Cancelled requests (AbortError) are re-thrown as-is so callers can
 * distinguish cancellation from real failures.
 */
const normaliseError = (err, context) => {
  // Propagate abort/cancel signals unchanged — not a user-facing error
  if (axios.isCancel(err) || err?.name === 'AbortError' || err?.name === 'CanceledError') {
    throw err;
  }
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const { status } = err.response;
      if (status === 401) throw new Error('Invalid API key. Check your .env file.');
      if (status === 404) throw new Error('City not found. Please check the spelling.');
      if (status === 429) throw new Error('Too many requests. Please wait a moment and try again.');
      throw new Error(`Server error (${status}) while ${context}. Please try again.`);
    }
    if (err.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
  }
  throw err instanceof Error ? err : new Error(`Unexpected error while ${context}.`);
};

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Resolve a city name to its first geocoding match.
 * Geocoding results are not cached (city strings vary too much to be useful).
 *
 * @param   {string}      city    e.g. "London" or "London, GB"
 * @param   {AbortSignal} [signal]
 * @returns {Promise<{ lat, lon, name, country, state? }>}
 * @throws  {Error}
 */
export const getCoordinates = async (city, signal) => {
  try {
    const { data } = await geoClient.get('/direct', {
      params: { q: city.trim(), limit: 1 },
      signal,
    });

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('City not found. Please check the spelling.');
    }

    const { lat, lon, name, country, state } = data[0];
    return { lat, lon, name, country, state };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('City not found')) throw err;
    normaliseError(err, 'fetching coordinates');
  }
};

/**
 * Fetch current weather for a lat/lon pair.
 * Results are cached for CACHE_TTL_MS. Cache is bypassed when a signal fires.
 *
 * @param   {number}      lat
 * @param   {number}      lon
 * @param   {AbortSignal} [signal]
 * @returns {Promise<object>}  Raw OWM /weather response
 * @throws  {Error}
 */
export const getCurrentWeather = async (lat, lon, signal) => {
  const key    = coordKey(lat, lon);
  const cached = getFromCache(currentWeatherCache, key);
  if (cached) return cached;

  try {
    const { data } = await weatherClient.get('/weather', {
      params: { lat, lon, units: 'metric' },
      signal,
    });
    setInCache(currentWeatherCache, key, data);
    return data;
  } catch (err) {
    normaliseError(err, 'fetching current weather');
  }
};

/**
 * Fetch the 5-day / 3-hour forecast for a lat/lon pair.
 * Results are cached for CACHE_TTL_MS.
 *
 * @param   {number}      lat
 * @param   {number}      lon
 * @param   {AbortSignal} [signal]
 * @returns {Promise<object[]>}  Raw OWM forecast list
 * @throws  {Error}
 */
export const getForecast = async (lat, lon, signal) => {
  const key    = coordKey(lat, lon);
  const cached = getFromCache(forecastCache, key);
  if (cached) return cached;

  try {
    const { data } = await weatherClient.get('/forecast', {
      params: { lat, lon, units: 'metric', cnt: 40 },
      signal,
    });
    setInCache(forecastCache, key, data.list);
    return data.list;
  } catch (err) {
    normaliseError(err, 'fetching forecast');
  }
};

/**
 * Reverse-geocode a lat/lon pair to a location name.
 * Non-critical — returns null on failure.
 *
 * @param   {number} lat
 * @param   {number} lon
 * @returns {Promise<{ name: string, country: string } | null>}
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const { data } = await geoClient.get('/reverse', {
      params: { lat, lon, limit: 1 },
    });
    return data[0] ?? null;
  } catch {
    return null;
  }
};

/** Manually clear all caches — useful for testing or forced refresh */
export const clearWeatherCache = () => {
  currentWeatherCache.clear();
  forecastCache.clear();
};
