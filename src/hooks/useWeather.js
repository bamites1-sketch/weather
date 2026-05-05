/**
 * useWeather.js — Central state manager for all weather data.
 *
 * New in this version:
 *  - Auto-location on first load (geolocation → fallback to "London")
 *  - isOnline state — blocks API calls when offline
 *  - refresh() — re-fetches the current city, busting the cache
 *  - Search history capped at 5 (was 6)
 *  - Smart error messages: city not found / network / rate limit
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getCoordinates,
  getCurrentWeather,
  getForecast,
  clearWeatherCache,
} from '../services/weatherApi';
import {
  transformCurrentWeather,
  transformForecast,
  transformHourly,
} from '../utils/transforms';

// ─── Constants ────────────────────────────────────────────────────────────────

const HISTORY_KEY    = 'wx_history';
const UNITS_KEY      = 'wx_units';
const MAX_HISTORY    = 5;
const DEFAULT_CITY   = 'London';   // fallback when geolocation is denied

// ─── Unit conversion (module-level pure functions) ────────────────────────────

const convertTemp = (celsius, units) =>
  units === 'metric'
    ? Math.round(celsius)
    : Math.round(celsius * 9 / 5 + 32);

const convertWind = (ms, units) =>
  units === 'metric' ? +ms.toFixed(1) : +(ms * 2.237).toFixed(1);

// ─── Smart error messages ─────────────────────────────────────────────────────

/**
 * Map raw error messages to clean, user-friendly strings.
 * Keeps all error copy in one place.
 */
const friendlyError = (message = '') => {
  if (message.includes('City not found'))
    return "City not found. Try a different city name.";
  if (message.includes('Invalid API key'))
    return "Invalid API key. Check your .env file.";
  if (message.includes('Too many requests') || message.includes('429'))
    return "Too many requests. Please wait a moment and try again.";
  if (message.includes('Network error') || message.includes('internet'))
    return "Network error. Check your internet connection.";
  if (message.includes('Location access denied'))
    return "Location access denied. Please search for a city manually.";
  return message || "Something went wrong. Please try again.";
};

// ─── Pure display-data selector ───────────────────────────────────────────────

const buildDisplayData = (rawCurrent, rawForecastList, cityName, units) => {
  const current = transformCurrentWeather(rawCurrent, cityName);
  const daily   = transformForecast(rawForecastList);
  const hourly  = transformHourly(rawForecastList);

  const currentWeather = {
    ...current,
    temp:      convertTemp(current.temp,      units),
    feelsLike: convertTemp(current.feelsLike, units),
    tempMin:   convertTemp(current.tempMin,   units),
    tempMax:   convertTemp(current.tempMax,   units),
    windSpeed: convertWind(current.windSpeed, units),
    windGust:  current.windGust != null ? convertWind(current.windGust, units) : null,
    units,
  };

  const dailyForecast = daily.map((day) => ({
    ...day,
    temp:      convertTemp(day.temp,      units),
    tempMin:   convertTemp(day.tempMin,   units),
    tempMax:   convertTemp(day.tempMax,   units),
    windSpeed: convertWind(day.windSpeed, units),
    units,
  }));

  const hourlyForecast = hourly.map((slot) => ({
    ...slot,
    temp: convertTemp(slot.temp, units),
    units,
  }));

  return { currentWeather, dailyForecast, hourlyForecast };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useWeather = () => {

  // ── Unit preference ──────────────────────────────────────────────────────
  const [units, setUnits] = useState(
    () => localStorage.getItem(UNITS_KEY) ?? 'metric'
  );

  // ── Search history (max 5) ───────────────────────────────────────────────
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  // ── Fetch lifecycle ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Network state ────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // ── Raw API data (state for useMemo reactivity + refs for callbacks) ─────
  const [rawCurrent,   setRawCurrent]   = useState(null);
  const [rawForecast,  setRawForecast]  = useState(null);
  const [resolvedCity, setResolvedCity] = useState('');

  const rawCurrentRef   = useRef(null);
  const rawForecastRef  = useRef(null);
  const resolvedCityRef = useRef('');

  // ── AbortController ──────────────────────────────────────────────────────
  const abortRef = useRef(null);

  // ── Persist preferences ──────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem(UNITS_KEY, units);
  }, [units]);

  // ── Network online/offline listeners ─────────────────────────────────────

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Declarative display data ─────────────────────────────────────────────

  const displayData = useMemo(() => {
    if (!rawCurrent || !rawForecast) return null;
    return buildDisplayData(rawCurrent, rawForecast, resolvedCity, units);
  }, [rawCurrent, rawForecast, resolvedCity, units]);

  const currentWeather = displayData?.currentWeather  ?? null;
  const dailyForecast  = displayData?.dailyForecast   ?? [];
  const hourlyForecast = displayData?.hourlyForecast  ?? [];

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addToHistory = useCallback((name) => {
    setSearchHistory((prev) => {
      const deduped = prev.filter((c) => c.toLowerCase() !== name.toLowerCase());
      return [name, ...deduped].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const storeRawData = useCallback((rawCur, rawFor, cityName) => {
    rawCurrentRef.current   = rawCur;
    rawForecastRef.current  = rawFor;
    resolvedCityRef.current = cityName;
    setRawCurrent(rawCur);
    setRawForecast(rawFor);
    setResolvedCity(cityName);
  }, []);

  const getNextSignal = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const isCancellation = (err) =>
    err?.name === 'AbortError' ||
    err?.name === 'CanceledError' ||
    err?.code  === 'ERR_CANCELED';

  // ── Core fetch pipeline ───────────────────────────────────────────────────

  const searchCity = useCallback(async (cityQuery) => {
    const trimmed = cityQuery.trim();
    if (!trimmed) return;

    // Block fetch when offline
    if (!navigator.onLine) {
      setError("You're offline. Check your internet connection.");
      return;
    }

    const signal = getNextSignal();
    setLoading(true);
    setError(null);

    try {
      const { lat, lon, name, country } = await getCoordinates(trimmed, signal);
      const resolvedName = country ? `${name}, ${country}` : name;

      const [rawCur, rawFor] = await Promise.all([
        getCurrentWeather(lat, lon, signal),
        getForecast(lat, lon, signal),
      ]);

      storeRawData(rawCur, rawFor, resolvedName);
      setLoading(false);
      addToHistory(resolvedName);
    } catch (err) {
      if (isCancellation(err)) return;
      setLoading(false);
      setError(friendlyError(err.message));
      storeRawData(null, null, '');
    }
  }, [getNextSignal, storeRawData, addToHistory]);

  const searchByCoords = useCallback(async (lat, lon) => {
    if (!navigator.onLine) {
      setError("You're offline. Check your internet connection.");
      return;
    }

    const signal = getNextSignal();
    setLoading(true);
    setError(null);

    try {
      const [rawCur, rawFor] = await Promise.all([
        getCurrentWeather(lat, lon, signal),
        getForecast(lat, lon, signal),
      ]);

      const resolvedName = rawCur.name || 'Your Location';
      storeRawData(rawCur, rawFor, resolvedName);
      setLoading(false);
      addToHistory(resolvedName);
    } catch (err) {
      if (isCancellation(err)) return;
      setLoading(false);
      setError(friendlyError(err.message));
    }
  }, [getNextSignal, storeRawData, addToHistory]);

  // ── Geolocation detect ────────────────────────────────────────────────────

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Browser doesn't support geolocation — fall back to default city
      searchCity(DEFAULT_CITY);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => searchByCoords(coords.latitude, coords.longitude),
      () => {
        // Permission denied or unavailable — fall back to default city
        searchCity(DEFAULT_CITY);
      },
      { timeout: 10000 }
    );
  }, [searchByCoords, searchCity]);

  // ── Auto-location on first mount ──────────────────────────────────────────
  // Use a ref flag so this runs exactly once without triggering the linter's
  // "setState inside effect" rule — detectLocation is called via a timeout
  // so it runs after the initial render cycle completes.
  const didAutoDetect = useRef(false);
  useEffect(() => {
    if (didAutoDetect.current) return;
    didAutoDetect.current = true;
    const id = setTimeout(() => detectLocation(), 0);
    return () => clearTimeout(id);
  // detectLocation is stable (useCallback with no deps that change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Refresh current city (busts cache) ───────────────────────────────────

  const refresh = useCallback(() => {
    const city = resolvedCityRef.current;
    if (!city) return;
    // Clear the cache entry so we get fresh data
    clearWeatherCache();
    searchCity(city);
  }, [searchCity]);

  // ── Unit toggle ───────────────────────────────────────────────────────────

  const toggleUnits = useCallback(() => {
    setUnits((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    currentWeather,
    dailyForecast,
    hourlyForecast,
    loading,
    error,
    city: resolvedCity,
    units,
    isOnline,
    searchHistory,
    searchCity,
    detectLocation,
    toggleUnits,
    clearHistory,
    refresh,
  };
};
