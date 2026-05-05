/**
 * translations.js — Single source of truth for all UI strings.
 *
 * Rules:
 *  - Every key that exists in 'en' MUST exist in every other locale.
 *  - No JSX, no logic — plain strings only.
 *  - Add a new language by adding a new top-level key (e.g. 'fr', 'ar').
 *
 * Sections:
 *  app        — brand / shell
 *  search     — search bar
 *  weather    — current weather card labels
 *  stats      — stat tile sub-labels (high/moderate/low etc.)
 *  sun        — sunrise/sunset row
 *  forecast   — hourly + daily forecast
 *  conditions — OWM weather description overrides (keyed by OWM description)
 *  weekdays   — full weekday names (index 0 = Sunday)
 *  weekdays_short — 3-letter abbreviations
 *  errors     — error messages
 *  actions    — button labels
 */

const translations = {

  // ── English ────────────────────────────────────────────────────────────────
  en: {
    // App shell
    app_name:           'WeatherNow',
    app_tagline:        'Real-time weather dashboard',
    powered_by:         'Powered by',

    // Search
    search_placeholder: 'Search city…',
    search_recent:      'Recent',
    search_clear_all:   'Clear all',

    // Current weather
    temperature:        'Temperature',
    feels_like:         'Feels like',
    humidity:           'Humidity',
    wind:               'Wind',
    pressure:           'Pressure',
    visibility:         'Visibility',
    gust:               'Gust',

    // Stat sub-labels
    high:               'High',
    moderate:           'Moderate',
    low:                'Low',
    excellent:          'Excellent',
    good:               'Good',
    poor:               'Poor',
    pressure_high:      'High pressure',
    pressure_low:       'Low pressure',

    // Sun row
    sunrise:            'Sunrise',
    sunset:             'Sunset',
    daylight:           'Daylight',

    // Forecast
    hourly_title:       'Next 24 Hours',
    forecast_title:     '7-Day Forecast',
    now:                'Now',
    today:              'Today',

    // Weather conditions (OWM description → translated label)
    condition_clear:        'Clear',
    condition_cloudy:       'Cloudy',
    condition_rain:         'Rain',
    condition_drizzle:      'Drizzle',
    condition_thunderstorm: 'Thunderstorm',
    condition_snow:         'Snow',
    condition_mist:         'Mist',
    condition_fog:          'Fog',
    condition_haze:         'Haze',
    condition_smoke:        'Smoke',
    condition_dust:         'Dust',
    condition_tornado:      'Tornado',

    // Weekdays (index 0 = Sunday)
    weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    weekdays_short: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],

    // Errors
    error_title:        'Something went wrong',
    error_city:         'City not found. Try a different city name.',
    error_api_key:      'Invalid API key. Check your .env file.',
    error_rate_limit:   'Too many requests. Please wait a moment.',
    error_network:      'Network error. Check your internet connection.',
    error_offline:      "You're offline — showing cached data.",
    error_location:     'Location access denied. Please search manually.',
    error_generic:      'Something went wrong. Please try again.',

    // Actions
    action_location:    'Use My Location',
    action_try_location:'Try my location',
    action_retry:       'Retry last search',
    action_refresh:     'Refresh',
    action_welcome_title:   'Welcome to WeatherNow',
    action_welcome_sub:     'Search for any city or use your current location.',
  },

  // ── Amharic (አማርኛ) ────────────────────────────────────────────────────────
  am: {
    // App shell
    app_name:           'WeatherNow',
    app_tagline:        'የቀጥታ የአየር ሁኔታ ዳሽቦርድ',
    powered_by:         'በ',

    // Search
    search_placeholder: 'ከተማ ፈልግ…',
    search_recent:      'የቅርብ ጊዜ',
    search_clear_all:   'ሁሉንም አጽዳ',

    // Current weather
    temperature:        'ሙቀት',
    feels_like:         'የሚሰማው',
    humidity:           'እርጥበት',
    wind:               'ነፋስ',
    pressure:           'ግፊት',
    visibility:         'ታይነት',
    gust:               'ዝናብ ነፋስ',

    // Stat sub-labels
    high:               'ከፍተኛ',
    moderate:           'መካከለኛ',
    low:                'ዝቅተኛ',
    excellent:          'እጅግ ጥሩ',
    good:               'ጥሩ',
    poor:               'ደካማ',
    pressure_high:      'ከፍተኛ ግፊት',
    pressure_low:       'ዝቅተኛ ግፊት',

    // Sun row
    sunrise:            'ፀሐይ መውጣት',
    sunset:             'ፀሐይ መጥለቅ',
    daylight:           'የቀን ብርሃን',

    // Forecast
    hourly_title:       'ቀጣዮቹ 24 ሰዓታት',
    forecast_title:     '7 ቀናት ትንበያ',
    now:                'አሁን',
    today:              'ዛሬ',

    // Weather conditions
    condition_clear:        'ግልጽ',
    condition_cloudy:       'ደመናማ',
    condition_rain:         'ዝናብ',
    condition_drizzle:      'ቀላል ዝናብ',
    condition_thunderstorm: 'ነጎድጓድ',
    condition_snow:         'በረዶ',
    condition_mist:         'ጭጋግ',
    condition_fog:          'ጭጋግ',
    condition_haze:         'ደበዛዛ',
    condition_smoke:        'ጭስ',
    condition_dust:         'አቧራ',
    condition_tornado:      'አውሎ ነፋስ',

    // Weekdays (index 0 = Sunday)
    weekdays: ['እሑድ','ሰኞ','ማክሰኞ','ረቡዕ','ሐሙስ','ዓርብ','ቅዳሜ'],
    weekdays_short: ['እሑ','ሰኞ','ማክ','ረቡ','ሐሙ','ዓርብ','ቅዳ'],

    // Errors
    error_title:        'ችግር ተፈጥሯል',
    error_city:         'ከተማ አልተገኘችም። ሌላ ስም ሞክር።',
    error_api_key:      'ልክ ያልሆነ API ቁልፍ። .env ፋይልህን ፈትሽ።',
    error_rate_limit:   'ብዙ ጥያቄዎች። ትንሽ ቆይ።',
    error_network:      'የኔትወርክ ስህተት። ኢንተርኔትህን ፈትሽ።',
    error_offline:      'ከኢንተርኔት ተቋርጠሃል — የተቀመጠ ውሂብ እያሳየ ነው።',
    error_location:     'የቦታ ፈቃድ ተከልክሏል። እባክህ ፈልግ።',
    error_generic:      'ችግር ተፈጥሯል። እንደገና ሞክር።',

    // Actions
    action_location:    'ቦታዬን ተጠቀም',
    action_try_location:'ቦታዬን ሞክር',
    action_retry:       'እንደገና ሞክር',
    action_refresh:     'አድስ',
    action_welcome_title:   'እንኳን ወደ WeatherNow መጡ',
    action_welcome_sub:     'ማንኛውንም ከተማ ፈልግ ወይም ቦታህን ተጠቀም።',
  },
};

export default translations;
