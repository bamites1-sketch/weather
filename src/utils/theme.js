/**
 * theme.js — Maps weather conditions to Tailwind gradient classes.
 *
 * Separated from transforms.js because this is a UI/presentation concern,
 * not a data-transformation concern. transforms.js should have no knowledge
 * of Tailwind or visual styling.
 *
 * @param   {number}  id     OWM weather condition id
 * @param   {boolean} night  True if current time is after sunset / before sunrise
 * @returns {string}  Tailwind `from-*` gradient class string
 */
export const conditionToTheme = (id, night = false) => {
  if (night)          return 'from-slate-900 via-blue-950 to-indigo-950';
  if (id >= 200 && id < 300) return 'from-gray-900 via-slate-800 to-gray-700';   // thunderstorm
  if (id >= 300 && id < 400) return 'from-slate-700 via-blue-800 to-slate-600';  // drizzle
  if (id >= 500 && id < 600) return 'from-slate-800 via-blue-900 to-slate-700';  // rain
  if (id >= 600 && id < 700) return 'from-slate-200 via-blue-100 to-slate-100';  // snow
  if (id >= 700 && id < 800) return 'from-gray-500 via-slate-400 to-gray-400';   // atmosphere/fog
  if (id === 800)             return 'from-sky-400 via-blue-500 to-indigo-600';   // clear sky
  if (id > 800)               return 'from-slate-500 via-blue-600 to-slate-500';  // cloudy
  return 'from-blue-600 via-indigo-600 to-purple-700';                            // fallback
};
