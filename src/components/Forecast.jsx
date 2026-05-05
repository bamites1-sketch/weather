import { memo, useMemo } from 'react';
import { iconUrl, getLocalizedDay, getLocalizedCondition } from '../utils/transforms';
import { useI18n } from '../i18n/I18nContext';

// ── Hourly slot ───────────────────────────────────────────────────────────────
const HourlySlot = memo(({ slot, isFirst }) => {
  const { t } = useI18n();
  return (
    <div className={`
      flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl
      min-w-[70px] sm:min-w-[76px] flex-shrink-0 border
      ${isFirst ? 'bg-white/25 border-white/30' : 'glass-card border-white/10'}
    `}>
      <p className={`text-xs font-semibold ${isFirst ? 'text-white' : 'text-white/50'}`}>
        {isFirst ? t('now') : slot.time}
      </p>
      <img
        src={iconUrl(slot.icon)}
        alt={getLocalizedCondition(slot.description, t)}
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        className="w-8 h-8 sm:w-9 sm:h-9"
      />
      <p className="text-white font-bold text-sm">{slot.temp}&deg;</p>
      {slot.pop > 0 && (
        <p className="text-blue-300 text-xs font-medium">💧{slot.pop}%</p>
      )}
    </div>
  );
});
HourlySlot.displayName = 'HourlySlot';

// ── Hourly forecast ───────────────────────────────────────────────────────────
export const HourlyForecast = memo(({ hourlyData }) => {
  const { t } = useI18n();
  if (!hourlyData?.length) return null;

  return (
    <section aria-label={t('hourly_title')}>
      <div className="glass-card rounded-3xl p-4 sm:p-5">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
          ⏱ {t('hourly_title')}
        </h3>
        <div className="relative">
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 scroll-touch no-scrollbar">
            {hourlyData.map((slot, i) => (
              <HourlySlot key={slot.dt} slot={slot} isFirst={i === 0} />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l
                          from-black/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
});
HourlyForecast.displayName = 'HourlyForecast';

// ── Daily row ─────────────────────────────────────────────────────────────────
const DailyRow = memo(({ day, isToday, globalMin, globalMax }) => {
  const { t } = useI18n();

  const range    = globalMax - globalMin || 1;
  const barLeft  = ((day.tempMin - globalMin) / range) * 100;
  const barWidth = Math.max(((day.tempMax - day.tempMin) / range) * 100, 8);

  // Localised day name — uses the weekdays array from translations
  const dayLabel = isToday
    ? t('today')
    : getLocalizedDay(day.dt, t, true); // short = true → "Mon" / "ሰኞ"

  const condLabel = getLocalizedCondition(day.description, t);

  return (
    <div className="flex items-center gap-2 px-2 sm:px-3 py-2.5 sm:py-3
                    rounded-xl hover:bg-white/8 transition-colors">

      {/* Day */}
      <div className="w-16 sm:w-20 flex-shrink-0">
        <p className="text-white font-medium text-xs sm:text-sm">{dayLabel}</p>
        <p className="text-white/35 text-xs hidden sm:block">{day.displayDate}</p>
      </div>

      {/* Icon */}
      <img
        src={iconUrl(day.icon)}
        alt={condLabel}
        width={32}
        height={32}
        loading="lazy"
        decoding="async"
        className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0"
      />

      {/* Description — md+ only */}
      <p className="text-white/50 text-xs capitalize flex-1 truncate hidden md:block">
        {condLabel}
      </p>

      {/* Precipitation */}
      <div className="w-8 sm:w-10 text-center flex-shrink-0">
        {day.pop > 0 && (
          <p className="text-blue-300 text-xs font-medium">{day.pop}%</p>
        )}
      </div>

      {/* Temp bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-28 sm:w-36">
        <span className="text-white/45 text-xs w-7 sm:w-8 text-right tabular-nums">
          {day.tempMin}&deg;
        </span>
        <div className="flex-1 h-1.5 bg-white/15 rounded-full relative overflow-hidden">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400 gpu"
            style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
          />
        </div>
        <span className="text-white font-semibold text-xs w-7 sm:w-8 tabular-nums">
          {day.tempMax}&deg;
        </span>
      </div>
    </div>
  );
});
DailyRow.displayName = 'DailyRow';

// ── Daily forecast ────────────────────────────────────────────────────────────
export const DailyForecast = memo(({ dailyData }) => {
  const { t } = useI18n();

  const days = useMemo(() => dailyData?.slice(0, 7) ?? [], [dailyData]);

  const { globalMin, globalMax } = useMemo(() => {
    if (!days.length) return { globalMin: 0, globalMax: 0 };
    return {
      globalMin: Math.min(...days.map(d => d.tempMin)),
      globalMax: Math.max(...days.map(d => d.tempMax)),
    };
  }, [days]);

  if (!days.length) return null;

  return (
    <section aria-label={t('forecast_title')}>
      <div className="glass-card rounded-3xl p-4 sm:p-5">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">
          📅 {t('forecast_title')}
        </h3>
        <div className="divide-y divide-white/5">
          {days.map((day, i) => (
            <DailyRow
              key={day.dt}
              day={day}
              isToday={i === 0}
              globalMin={globalMin}
              globalMax={globalMax}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
DailyForecast.displayName = 'DailyForecast';
