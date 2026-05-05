import { useState, useRef, useEffect, memo, useCallback } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useI18n } from '../i18n/I18nContext';

const SearchBar = memo(({
  onSearch,
  onDetectLocation,
  searchHistory,
  onClearHistory,
  loading,
}) => {
  const { t } = useI18n();

  const [inputValue,  setInputValue]  = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);

  const debouncedValue   = useDebounce(inputValue, 400);
  const inputRef         = useRef(null);
  const containerRef     = useRef(null);
  const skipNextDebounce = useRef(false);

  // Debounced auto-search
  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed.length < 2) return;
    if (skipNextDebounce.current) { skipNextDebounce.current = false; return; }
    onSearch(trimmed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowHistory(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const triggerSearch = useCallback((city) => {
    skipNextDebounce.current = true;
    onSearch(city);
    setShowHistory(false);
    setActiveIdx(-1);
  }, [onSearch]);

  const handleKeyDown = useCallback((e) => {
    if (showHistory && searchHistory.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, searchHistory.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, -1));
        return;
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        triggerSearch(searchHistory[activeIdx]);
        setInputValue('');
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) triggerSearch(trimmed);
    }
    if (e.key === 'Escape') {
      setShowHistory(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  }, [showHistory, searchHistory, activeIdx, inputValue, triggerSearch]);

  const handleClear = useCallback(() => {
    setInputValue('');
    skipNextDebounce.current = false;
    inputRef.current?.focus();
  }, []);

  const isOpen = showHistory && searchHistory.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40
                           pointer-events-none text-sm" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setActiveIdx(-1); }}
            onFocus={() => setShowHistory(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('search_placeholder')}
            disabled={loading}
            aria-label={t('search_placeholder')}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-activedescendant={activeIdx >= 0 ? `hi-${activeIdx}` : undefined}
            className="w-full pl-9 pr-8 py-3 rounded-xl text-sm
                       bg-white/15 border border-white/20 text-white
                       placeholder-white/40 focus:outline-none
                       focus:ring-2 focus:ring-white/30 focus:bg-white/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear"
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                         text-white/40 hover:text-white/70 transition-colors
                         text-xs p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDetectLocation}
          disabled={loading}
          aria-label={t('action_location')}
          title={t('action_location')}
          className="px-3.5 py-3 rounded-xl text-base
                     bg-white/15 border border-white/20 text-white
                     hover:bg-white/25 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          📍
        </button>
      </div>

      {/* History dropdown */}
      {isOpen && (
        <div
          className="absolute top-full mt-1 w-full z-50
                     bg-slate-900/95 border border-white/10 rounded-xl
                     shadow-2xl overflow-hidden"
          role="listbox"
          aria-label={t('search_recent')}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">
              🕐 {t('search_recent')}
            </span>
            <button
              type="button"
              onClick={() => { onClearHistory(); setShowHistory(false); }}
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              {t('search_clear_all')}
            </button>
          </div>
          <ul>
            {searchHistory.map((city, i) => (
              <li key={city} id={`hi-${i}`} role="option" aria-selected={activeIdx === i}>
                <button
                  type="button"
                  onClick={() => { setInputValue(''); triggerSearch(city); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2
                              text-white/80 text-sm transition-colors
                              ${activeIdx === i ? 'bg-white/15' : 'hover:bg-white/10'}`}
                >
                  <span className="text-white/30 text-xs" aria-hidden="true">📍</span>
                  <span className="flex-1 truncate">{city}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;
