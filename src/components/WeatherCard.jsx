import { memo } from 'react';
import {
  iconUrl,
  windDirection,
  isNight,
  formatLocalTime,
  formatDaylight,
  getLocalizedCondition,
} from '../utils/transforms';
import { useI18n } from '../i18n/I18nContext';

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = memo(({ icon, label, value, sub }) => (
  <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col gap-1">
    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
      <span aria-hidden="true">{icon}</span>{label}
    </p>
    <p className="text-white text-lg sm:text-xl font-bold">{value}</p>
    {sub && <p className="text-white/40 text-xs">{sub}</p>}
  </div>
));
StatTile.displayName = 'StatTile';

// ── Sun tile ──────────────────────────────────────────────────────────────────
const SunTile = memo(({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-xl sm:text-2xl" aria-hidden="true">{icon}</span>
    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-white font-semibold text-xs sm:text-sm">{value}</p>
  </div>
));
SunTile.displayName = 'SunTile';

// ── Main component ────────────────────────────────────────────────────────────
const WeatherCard = memo(({ weather }) => {
  const { t } = useI18n();
  if (!weather) return null;

  const {
    city, temp, feelsLike, tempMin, tempMax,
    humidity, pressure, windSpeed, windDeg, windGust,
    visibility, description, icon,
    sunrise, sunset, dt, timezone, units,
  } = weather;

  const unitLabel  = units === 'metric' ? '°C' : '°F';
  const windUnit   = units === 'metric' ? 'm/s' : 'mph';
  const night      = isNight(dt, sunrise, sunset);
  const localDesc  = getLocalizedCondition(description, t);

  // Humidity sub-label
  const humSub = humidity > 70 ? t('high') : humidity > 40 ? t('moderate') : t('low');

  // Wind sub-label
  const windSub = `${windDirection(windDeg)}${windGust != null ? ` · ${t('gust')} ${windGust}` : ''}`;

  // Pressure sub-label
  const presSub = pressure >= 1013 ? t('pressure_high') : t('pressure_low');

  // Visibility sub-label
  const visSub = visibility == null ? '' :
    visibility >= 10000 ? t('excellent') :
    visibility >= 5000  ? t('good') : t('poor');

  return (
    <div className="space-y-3">

      {/* ── Main card ── */}
      <div className="glass-card rounded-3xl p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-white/50 text-sm" aria-hidden="true">📍</span>
              <h2 className="text-white/80 text-sm font-medium truncate">{city}</h2>
            </div>
            <p className="text-white/35 text-xs mb-3">{formatLocalTime(dt, timezone)}</p>

            <p
              className="temp-display text-white"
              aria-label={`${t('temperature')}: ${temp} ${unitLabel}`}
            >
              {temp}{unitLabel}
            </p>

            <p className="text-white/70 text-sm sm:text-base font-medium mt-1.5 capitalize">
              {localDesc}
            </p>
            <p className="text-white/40 text-xs sm:text-sm mt-1">
              {t('feels_like')} {feelsLike}{unitLabel}
            </p>
            <div className="flex gap-3 mt-1.5">
              <span className="text-white/55 text-xs sm:text-sm">↑ {tempMax}{unitLabel}</span>
              <span className="text-white/55 text-xs sm:text-sm">↓ {tempMin}{unitLabel}</span>
            </div>
          </div>

          <img
            src={iconUrl(icon, '4x')}
            alt={localDesc}
            width={128}
            height={128}
            loading="eager"
            decoding="async"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 drop-shadow-xl flex-shrink-0"
          />
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatTile
          icon="💧"
          label={t('humidity')}
          value={`${humidity}%`}
          sub={humSub}
        />
        <StatTile
          icon="💨"
          label={t('wind')}
          value={`${windSpeed} ${windUnit}`}
          sub={windSub}
        />
        <StatTile
          icon="🌡️"
          label={t('pressure')}
          value={`${pressure} hPa`}
          sub={presSub}
        />
        <StatTile
          icon="👁️"
          label={t('visibility')}
          value={visibility != null ? `${(visibility / 1000).toFixed(1)} km` : 'N/A'}
          sub={visSub}
        />
      </div>

      {/* ── Sunrise / Sunset ── */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 flex justify-around items-center">
        <SunTile icon="🌅" label={t('sunrise')} value={formatLocalTime(sunrise, timezone)} />
        <div className="w-px h-8 bg-white/10" aria-hidden="true" />
        <SunTile
          icon={night ? '🌙' : '☀️'}
          label={t('daylight')}
          value={formatDaylight(sunrise, sunset)}
        />
        <div className="w-px h-8 bg-white/10" aria-hidden="true" />
        <SunTile icon="🌇" label={t('sunset')} value={formatLocalTime(sunset, timezone)} />
      </div>

    </div>
  );
});

WeatherCard.displayName = 'WeatherCard';
export default WeatherCard;
