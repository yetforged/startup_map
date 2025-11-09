import { useMemo, useState } from 'react'
import IndiaMap from './components/IndiaMap.jsx'
import ChartsPanel from './components/ChartsPanel.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import indianStatesData from './data/indian-states-data.json'
import { useTheme } from './contexts/ThemeContext'

function App() {
  const { isDark, toggleTheme } = useTheme()
  const [selectedState, setSelectedState] = useState(null)
  const [selectedMeta, setSelectedMeta] = useState(null)
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const searchIndex = useMemo(() => {
    const items = []
    
    // Add items from Indian states data
    for (const [stateKey, details] of Object.entries(indianStatesData || {})) {
      items.push({
        type: 'state',
        label: details.fullName,
        state: details.fullName
      })
    }
    
    return items
  }, [])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return searchIndex
      .filter((item) => item.label.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, searchIndex])

  function handleSelect(stateMeta) {
    const stateName = stateMeta?.name || ''
    const stateData = indianStatesData[stateName]
    
    setSelectedMeta(stateMeta || null)
    
    if (stateData) {
      setSelectedState({
        state: stateData.fullName,
        ...stateData
      })
    } else {
      setSelectedState(null)
    }
  }

  function selectStateByName(name) {
    if (!name) return
    handleSelect({ name })
  }

  function handleKeyDown(e) {
    if (!isFocused) return
    const max = suggestions.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (max < 0) return
      setActiveIndex((prev) => (prev < 0 ? 0 : Math.min(prev + 1, max)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (max < 0) return
      setActiveIndex((prev) => (prev <= 0 ? -1 : prev - 1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex <= max) {
        const target = suggestions[activeIndex]
        setQuery('')
        selectStateByName(target.state)
        setIsFocused(false)
        setActiveIndex(-1)
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className={`${isDark ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 text-gray-900'} min-h-screen flex flex-col p-2 sm:p-4 font-sans transition-colors duration-300`}>
      <div className={`${isDark ? 'bg-neutral-900/30 border-neutral-800/50' : 'bg-white/60 border-gray-200'} backdrop-blur-sm rounded-xl border shadow-2xl flex-grow flex flex-col transition-colors duration-300`}>
        {/* Header */}
        <header className={`p-4 sm:p-6 border-b ${isDark ? 'border-neutral-800/50 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30' : 'border-gray-200 bg-gradient-to-r from-white/50 to-gray-50/30'} flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 sm:justify-between transition-colors duration-300`}>
          <div className="relative w-full sm:w-auto sm:min-w-[400px]">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 120)}
              onKeyDown={handleKeyDown}
              placeholder="Search states..."
              className={`w-full ${isDark ? 'bg-neutral-800/70 border-neutral-700/50 placeholder-neutral-400 text-neutral-100' : 'bg-white border-gray-300 placeholder-gray-400 text-gray-900'} backdrop-blur-sm border rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-lg hover:shadow-xl`}
            />
            {isFocused && suggestions.length > 0 && (
              <ul className={`absolute z-40 mt-2 w-full ${isDark ? 'bg-neutral-900/95 border-neutral-800/50' : 'bg-white/95 border-gray-200'} backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden`}>
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    className={`${idx === activeIndex ? 'bg-blue-500/20 border-l-4 border-blue-500' : ''} cursor-pointer px-4 py-3 text-base ${isDark ? 'hover:bg-neutral-800/70' : 'hover:bg-gray-100'} transition-all`}
                    onMouseDown={() => {
                      setQuery('');
                      selectStateByName(s.state);
                    }}
                  >
                    <span className="font-semibold">{s.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-full sm:w-auto sm:min-w-[350px] ${isDark ? 'bg-gradient-to-r from-neutral-800/70 to-neutral-800/50 border-neutral-700/50' : 'bg-gradient-to-r from-white to-gray-50 border-gray-300'} backdrop-blur-sm border rounded-xl px-5 py-3 flex items-center justify-center shadow-lg`}>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                {selectedState?.fullName || 'India'}
              </span>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl ${isDark ? 'bg-neutral-800/70 hover:bg-neutral-700/70 border-neutral-700/50' : 'bg-white hover:bg-gray-50 border-gray-300'} border backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-110`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-6 gap-4 sm:gap-6">
          {/* Left Column - Map and Stats */}
          <div className="xl:col-span-2 flex flex-col gap-4 sm:gap-6">
            <div className={`rounded-xl border ${isDark ? 'border-neutral-800/50 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40' : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'} backdrop-blur-sm p-3 shadow-xl transition-colors duration-300`}>
              <IndiaMap 
                src="/india-states.svg" 
                onSelect={handleSelect} 
                selected={selectedMeta} 
                height={450} 
              />
            </div>
            <StatsPanel selectedStateName={selectedState?.fullName} />
          </div>

          {/* Right Column - Charts */}
          <div className="xl:col-span-4">
            <ChartsPanel selectedStateName={selectedState?.fullName} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
