import { useState, useEffect, memo } from 'react';
import { useWeather }        from './hooks/useWeather';
import { useTranslation }    from './i18n/useTranslation';
import { I18nContext, useI18n } from './i18n/I18nContext';
import { isNight }           from './utils/transforms';
import { conditionToTheme }  from './utils/theme';
import SearchBar             from './components/SearchBar';
import WeatherCard           from './components/WeatherCard';
import { HourlyForecast, DailyForecast } from './components/Forecast';
import { SkeletonUI }        from './components/Loader';

// ── Language context — lets any child call useI18n() without prop-drilling ────
// Context lives in i18n/I18nContext.js — imported here for the Provider

// ── Language toggle button ────────────────────────────────────────────────────
const LangToggle = memo(({ lang, setLang }) => (
  <div className="flex items-center rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
    {[
      { code: 'en',  label: 'EN'     },
      { code: 'am',  label: 'አማ'    },
    ].map(({ code, label }) => (
      <button
        key={code}
        onClick={() => setLang(code)}
        aria-label={`Switch to ${code === 'en' ? 'English' : 'Amharic'}`}
        aria-pressed={lang === code}
        className={`
          px-2.5 py-2 text-xs font-bold transition-all
          ${lang === code
            ? 'bg-white/30 text-white'
            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80'}
        `}
      >
        {label}
      </button>
    ))}
  </div>
));
LangToggle.displayName = 'LangToggle';

// ── Offline banner ────────────────────────────────────────────────────────────
const OfflineBanner = memo(() => {
  const { t } = useI18n();
  return (
    <div
      role="alert"
      className="w-full bg-red-500/90 backdrop-blur-sm text-white text-sm
                 font-medium text-center py-2.5 px-4 flex items-center
                 justify-center gap-2"
    >
      <span aria-hidden="true">📡</span>
      {t('error_offline')}
    </div>
  );
});
OfflineBanner.displayName = 'OfflineBanner';

// ── Error state ───────────────────────────────────────────────────────────────
const ErrorState = memo(({ error, onDetectLocation, onRetry, showRetry }) => {
  const { t } = useI18n();
  return (
    <div role="alert" className="glass-card rounded-3xl p-8 text-center">
      <p className="text-4xl mb-3" aria-hidden="true">⚠️</p>
      <p className="text-white font-semibold mb-1">{t('error_title')}</p>
      <p className="text-white/60 text-sm mb-5">{error}</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onDetectLocation}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium
                     bg-white/20 border border-white/20 hover:bg-white/30
                     active:scale-95 transition-all"
        >
          📍 {t('action_try_location')}
        </button>
        {showRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-medium
                       bg-white/20 border border-white/20 hover:bg-white/30
                       active:scale-95 transition-all"
          >
            🔁 {t('action_retry')}
          </button>
        )}
      </div>
    </div>
  );
});
ErrorState.displayName = 'ErrorState';

// ── Welcome state ─────────────────────────────────────────────────────────────
const WelcomeState = memo(({ onDetectLocation }) => {
  const { t } = useI18n();
  return (
    <div className="glass-card rounded-3xl p-10 text-center">
      <p className="text-6xl mb-5" aria-hidden="true">🌍</p>
      <h2 className="text-white text-xl font-bold mb-2">{t('action_welcome_title')}</h2>
      <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
        {t('action_welcome_sub')}
      </p>
      <button
        onClick={onDetectLocation}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                   text-white font-semibold text-sm bg-white/20 border
                   border-white/20 hover:bg-white/30 active:scale-95 transition-all"
      >
        📍 {t('action_location')}
      </button>
    </div>
  );
});
WelcomeState.displayName = 'WelcomeState';

// ── Root ──────────────────────────────────────────────────────────────────────
const App = () => {
  const { t, lang, setLang } = useTranslation();

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('wx_dark') === 'true'
  );
  useEffect(() => {
    localStorage.setItem('wx_dark', isDark);
  }, [isDark]);

  const {
    currentWeather,
    dailyForecast,
    hourlyForecast,
    loading,
    error,
    units,
    isOnline,
    searchHistory,
    searchCity,
    detectLocation,
    toggleUnits,
    clearHistory,
    refresh,
  } = useWeather();

  const bgGradient = (() => {
    if (isDark) return 'from-slate-900 via-blue-950 to-indigo-950';
    if (!currentWeather) return 'from-sky-500 via-blue-600 to-indigo-700';
    const night = isNight(currentWeather.dt, currentWeather.sunrise, currentWeather.sunset);
    return conditionToTheme(currentWeather.conditionId, night);
  })();

  // Provide t + lang to the entire tree via context
  const i18nValue = { t, lang };

  return (
    <I18nContext.Provider value={i18nValue}>
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-colors duration-700`}
        // dir attribute prepares layout for future RTL languages (e.g. Arabic)
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        lang={lang}
      >
        {!isOnline && <OfflineBanner />}

        <div className="w-full max-w-screen-md mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-4">

          {/* ── Header ── */}
          <header className="flex items-center justify-between gap-2">
            {/* Brand */}
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg flex items-center gap-2 truncate">
                🌤️ {t('app_name')}
              </h1>
              <p className="text-white/35 text-xs hidden sm:block">{t('app_tagline')}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Refresh */}
              {currentWeather && (
                <button
                  onClick={refresh}
                  disabled={loading}
                  aria-label={t('action_refresh')}
                  title={t('action_refresh')}
                  className="p-2 rounded-xl text-base bg-white/15 border border-white/20
                             text-white hover:bg-white/25 active:scale-95
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span className={loading ? 'inline-block animate-spin' : 'inline-block'}>
                    🔄
                  </span>
                </button>
              )}

              {/* °C / °F */}
              <button
                onClick={toggleUnits}
                aria-label={`Switch to ${units === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
                className="px-2.5 py-2 rounded-xl text-white text-sm font-bold
                           bg-white/15 border border-white/20 min-w-[42px] text-center
                           hover:bg-white/25 active:scale-95 transition-all"
              >
                {units === 'metric' ? '°C' : '°F'}
              </button>

              {/* Dark / light */}
              <button
                onClick={() => setIsDark(d => !d)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-xl text-base bg-white/15 border border-white/20
                           hover:bg-white/25 active:scale-95 transition-all"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Language toggle */}
              <LangToggle lang={lang} setLang={setLang} />
            </div>
          </header>

          {/* ── Search ── */}
          <SearchBar
            onSearch={searchCity}
            onDetectLocation={detectLocation}
            searchHistory={searchHistory}
            onClearHistory={clearHistory}
            loading={loading}
          />

          {/* ── Main content ── */}
          <main className="flex flex-col gap-4">
            {loading && <SkeletonUI />}

            {!loading && error && (
              <ErrorState
                error={error}
                onDetectLocation={detectLocation}
                onRetry={() => searchCity(searchHistory[0])}
                showRetry={searchHistory.length > 0}
              />
            )}

            {!loading && !error && !currentWeather && (
              <WelcomeState onDetectLocation={detectLocation} />
            )}

            {!loading && !error && currentWeather && (
              <>
                <WeatherCard weather={currentWeather} />
                <HourlyForecast hourlyData={hourlyForecast} />
                <DailyForecast  dailyData={dailyForecast}  />
              </>
            )}
          </main>

          <footer className="text-center text-white/20 text-xs pb-1">
            {t('powered_by')}{' '}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/40 transition-colors"
            >
              OpenWeatherMap
            </a>
          </footer>
        </div>
      </div>
    </I18nContext.Provider>
  );
};

export default App;
