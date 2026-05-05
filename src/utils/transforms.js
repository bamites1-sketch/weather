/**
 * transforms.js — Pure data-transformation functions.
 *
 * Rules enforced here:
 *  - No API calls, no state, no side effects.
 *  - Every function takes raw OWM data and returns a clean, typed object.
 *  - Temperatures are stored as raw floats (NOT pre-rounded) so that
 *    unit conversion in the hook operates on full-precision values.
 *    Rounding happens once, at the very end of applyTransforms in useWeather.
 *
 * Exports (data transforms):
 *   transformCurrentWeather(raw, resolvedName)  → CurrentWeather
 *   transformForecast(list)                     → DailyForecast[]
 *   transformHourly(list)                       → HourlySlot[]
 *
 * Exports (UI helpers — pure, no side effects):
 *   iconUrl(code, size)
 *   windDirection(deg)
 *   isNight(dt, sunrise, sunset)
 *   formatLocalTime(unixTs, tzOffsetSec)
 *   formatDaylight(sunrise, sunset)
 */

// ─── Current weather ──────────────────────────────────────────────────────────

/**
 * Extract and shape the raw /weather response.
 *
 * Temperatures are stored as raw floats — NOT rounded here.
 * Rounding is deferred to the hook so unit conversion stays accurate.
 *
 * @param   {object} raw           Raw OWM /weather response
 * @param   {string} resolvedName  Canonical city name from geocoding
 * @returns {CurrentWeather}
 */
export const transformCurrentWeather = (raw, resolvedName) => ({
  city:        resolvedName || raw.name,
  country:     raw.sys.country,
  // Raw floats — rounded by the hook after optional unit conversion
  temp:        raw.main.temp,
  feelsLike:   raw.main.feels_like,
  tempMin:     raw.main.temp_min,
  tempMax:     raw.main.temp_max,
  humidity:    raw.main.humidity,       // % — integer, no conversion needed
  pressure:    raw.main.pressure,       // hPa — integer, no conversion needed
  windSpeed:   raw.wind.speed,          // m/s float
  windDeg:     raw.wind.deg   ?? 0,
  windGust:    raw.wind.gust  ?? null,  // m/s float, may be absent
  visibility:  raw.visibility ?? null,  // metres integer, may be absent
  description: raw.weather[0].description,
  icon:        raw.weather[0].icon,
  conditionId: raw.weather[0].id,
  sunrise:     raw.sys.sunrise,         // unix ts
  sunset:      raw.sys.sunset,          // unix ts
  dt:          raw.dt,                  // unix ts of observation
  timezone:    raw.timezone,            // UTC offset in seconds
});

// ─── Forecast ─────────────────────────────────────────────────────────────────

/**
 * Group the 3-hour forecast list into daily summaries (up to 7 days).
 *
 * Grouping strategy:
 *  1. Group all entries by calendar date string "YYYY-MM-DD".
 *  2. For each day, use the 12:00 UTC entry as the representative slot
 *     (best proxy for daytime conditions). Fall back to the first entry.
 *  3. Derive true daily min/max by scanning ALL entries for that date —
 *     not just the representative one.
 *
 * Temperatures stored as raw floats — rounded by the hook.
 *
 * @param   {object[]} list  Raw OWM forecast list (up to 40 entries)
 * @returns {DailyForecast[]}
 */
export const transformForecast = (list) => {
  // Step 1: group by date
  const byDate = list.reduce((acc, entry) => {
    const date = entry.dt_txt.slice(0, 10); // "YYYY-MM-DD"
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  // Step 2: one summary per day
  return Object.entries(byDate)
    .slice(0, 7)
    .map(([date, entries]) => {
      const rep =
        entries.find((e) => e.dt_txt.includes('12:00:00')) ?? entries[0];

      // True daily range from all entries for this date
      const temps = entries.map((e) => e.main.temp);

      return {
        date,                                    // "YYYY-MM-DD"
        dt:          rep.dt,                     // unix ts (for keying)
        weekday:     formatWeekday(rep.dt),      // "Monday"
        shortDay:    formatShortDay(rep.dt),     // "Mon"
        displayDate: formatDisplayDate(date),    // "Mon, Jan 15"
        // Raw floats — rounded by the hook
        temp:        rep.main.temp,
        tempMin:     Math.min(...temps),
        tempMax:     Math.max(...temps),
        description: rep.weather[0].description,
        icon:        rep.weather[0].icon,
        conditionId: rep.weather[0].id,
        humidity:    rep.main.humidity,
        pop:         Math.round((rep.pop ?? 0) * 100), // % — integer, fine to round here
        windSpeed:   rep.wind.speed,             // m/s float
      };
    });
};

/**
 * Extract the next 8 forecast slots (≈ 24 hours) for the hourly strip.
 * Temperatures stored as raw floats — rounded by the hook.
 *
 * @param   {object[]} list
 * @returns {HourlySlot[]}
 */
export const transformHourly = (list) =>
  list.slice(0, 8).map((entry) => ({
    dt:          entry.dt,
    time:        formatHour(entry.dt),           // "3 PM"
    temp:        entry.main.temp,                // raw float
    icon:        entry.weather[0].icon,
    description: entry.weather[0].description,
    pop:         Math.round((entry.pop ?? 0) * 100), // %
    humidity:    entry.main.humidity,
  }));

// ─── Date / time formatters ───────────────────────────────────────────────────
// All private — only used within this file by the transform functions above.

/** "Monday" */
const formatWeekday = (unixTs) =>
  new Date(unixTs * 1000).toLocaleDateString('en-US', { weekday: 'long' });

/** "Mon" */
const formatShortDay = (unixTs) =>
  new Date(unixTs * 1000).toLocaleDateString('en-US', { weekday: 'short' });

/**
 * "Mon, Jan 15"
 * Uses noon of the date string to avoid DST / timezone boundary edge cases
 * where midnight of a date string could resolve to the previous day.
 */
const formatDisplayDate = (dateStr) =>
  new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });

/** "3 PM" */
const formatHour = (unixTs) =>
  new Date(unixTs * 1000).toLocaleTimeString('en-US', {
    hour:   'numeric',
    hour12: true,
  });

// ─── Public UI helpers ────────────────────────────────────────────────────────
// Pure functions with no side effects — safe to call from components.

/** Build an OpenWeather icon URL */
export const iconUrl = (code, size = '2x') =>
  `https://openweathermap.org/img/wn/${code}@${size}.png`;

/** Convert wind degrees to an 8-point compass direction string */
export const windDirection = (deg) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

/** True when the observation time is outside the sunrise–sunset window */
export const isNight = (dt, sunrise, sunset) => dt < sunrise || dt > sunset;

/**
 * Format a unix timestamp to a local time string using the city's UTC offset.
 * Uses the UTC timezone trick: shift the timestamp by the offset, then format
 * in UTC so no browser-local timezone is applied.
 *
 * @param   {number} unixTs       Unix timestamp (seconds)
 * @param   {number} tzOffsetSec  City's UTC offset in seconds (from OWM `timezone`)
 * @returns {string}  e.g. "3:45 PM"
 */
export const formatLocalTime = (unixTs, tzOffsetSec) => {
  const shiftedMs = (unixTs + tzOffsetSec) * 1000;
  return new Date(shiftedMs).toLocaleTimeString('en-US', {
    hour:     'numeric',
    minute:   '2-digit',
    hour12:   true,
    timeZone: 'UTC', // interpret the shifted timestamp as UTC
  });
};

/**
 * Calculate and format the daylight duration between sunrise and sunset.
 *
 * @param   {number} sunrise  Unix timestamp
 * @param   {number} sunset   Unix timestamp
 * @returns {string}  e.g. "14h 23m"
 */
export const formatDaylight = (sunrise, sunset) => {
  const totalSec = sunset - sunrise;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${m}m`;
};

/**
 * getLocalizedDay — return a weekday name in the active language.
 *
 * Uses the translations weekdays/weekdays_short arrays so the output
 * matches whatever locale the user has selected — no Intl dependency needed.
 *
 * @param   {number}   unixTs  Unix timestamp (seconds)
 * @param   {function} t       Translation function from useTranslation
 * @param   {boolean}  short   If true, return the 3-letter abbreviation
 * @returns {string}   e.g. "Monday" | "ሰኞ" | "Mon" | "ሰኞ"
 */
export const getLocalizedDay = (unixTs, t, short = false) => {
  const dayIndex = new Date(unixTs * 1000).getDay(); // 0 = Sunday
  const key = short ? 'weekdays_short' : 'weekdays';
  const names = t(key);
  // t(key) returns the array from translations — index into it
  return Array.isArray(names) ? names[dayIndex] : new Date(unixTs * 1000)
    .toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
};

/**
 * getLocalizedCondition — map an OWM description string to a translated label.
 *
 * OWM returns English descriptions like "clear sky", "light rain", etc.
 * We map them to our condition_* translation keys.
 *
 * @param   {string}   description  Raw OWM description (lowercase)
 * @param   {function} t            Translation function
 * @returns {string}   Translated condition label, or the original description
 */
export const getLocalizedCondition = (description, t) => {
  const d = description.toLowerCase();
  if (d.includes('thunderstorm')) return t('condition_thunderstorm');
  if (d.includes('drizzle'))      return t('condition_drizzle');
  if (d.includes('rain'))         return t('condition_rain');
  if (d.includes('snow'))         return t('condition_snow');
  if (d.includes('mist'))         return t('condition_mist');
  if (d.includes('smoke'))        return t('condition_smoke');
  if (d.includes('haze'))         return t('condition_haze');
  if (d.includes('dust'))         return t('condition_dust');
  if (d.includes('fog'))          return t('condition_fog');
  if (d.includes('tornado'))      return t('condition_tornado');
  if (d.includes('clear'))        return t('condition_clear');
  if (d.includes('cloud'))        return t('condition_cloudy');
  return description; // unknown — return as-is
};
