import { useEffect, useRef, useState } from 'react'
import indianStatesData from '../data/indian-states-data.json'
import { useTheme } from '../contexts/ThemeContext'

// State ID to full name mapping - All Indian states
const stateIdToName = {
  'INMH': 'Maharashtra',
  'INGJ': 'Gujarat', 
  'INTN': 'Tamil Nadu',
  'INKA': 'Karnataka',
  'INKL': 'Kerala',
  'INUP': 'Uttar Pradesh',
  'INGA': 'Goa',
  'INRJ': 'Rajasthan',
  'INTG': 'Telangana',
  'INDL': 'Delhi',
  'INAP': 'Andhra Pradesh',
  'INAR': 'Arunachal Pradesh',
  'INAS': 'Assam',
  'INBR': 'Bihar',
  'INCT': 'Chhattisgarh',
  'INHR': 'Haryana',
  'INHP': 'Himachal Pradesh',
  'INJH': 'Jharkhand',
  'INMP': 'Madhya Pradesh',
  'INMN': 'Manipur',
  'INML': 'Meghalaya',
  'INMZ': 'Mizoram',
  'INNL': 'Nagaland',
  'INOR': 'Odisha',
  'INPB': 'Punjab',
  'INSK': 'Sikkim',
  'INTRP': 'Tripura',
  'INUT': 'Uttarakhand',
  'INWB': 'West Bengal',
  'INPY': 'Puducherry',
  'INCH': 'Chandigarh',
  'INDD': 'Daman and Diu',
  'INDN': 'Dadra and Nagar Haveli',
  'INLD': 'Lakshadweep',
  'INAN': 'Andaman and Nicobar',
  'INJK': 'Jammu and Kashmir',
  'INLA': 'Ladakh'
}

export default function IndiaMap({ src, onSelect, selected, height = 400 }) {
  const { isDark } = useTheme()
  const [svgReady, setSvgReady] = useState(false)
  const [hoveredState, setHoveredState] = useState(null)
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' })
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const scaleRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    let cancelled = false
    async function loadSvg() {
      if (!src || !containerRef.current) return
      try {
        const res = await fetch(src)
        const text = await res.text()
        if (cancelled) return
        
        containerRef.current.innerHTML = text
        const svg = containerRef.current.querySelector('svg')
        if (!svg) return
        
        svg.setAttribute('style', 'width: 100%; height: 100%;')
        svg.setAttribute('class', 'drop-shadow-lg')
        mapRef.current = svg
        setSvgReady(true)
      } catch (error) {
        console.error('Failed to load SVG:', error)
      }
    }
    loadSvg()
    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    if (!svgReady || !mapRef.current) return
    
    const allStates = mapRef.current.querySelectorAll('path[id]')
    
    allStates.forEach((stateElement) => {
      const stateId = stateElement.id
      const stateName = stateIdToName[stateId]
      
      // Only add interactivity to states we have data for
      if (stateName && indianStatesData[stateName]) {
        stateElement.style.cursor = 'pointer'
        
        const handleClick = () => {
          onSelect({ 
            name: stateName, 
            id: stateId, 
            el: stateElement 
          })
        }
        
        const handleMouseEnter = (e) => {
          setHoveredState(stateId)
          setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY,
            text: stateName
          })
        }
        
        const handleMouseLeave = () => {
          setHoveredState(null)
          setTooltip({ show: false, x: 0, y: 0, text: '' })
        }
        
        const handleMouseMove = (e) => {
          if (hoveredState === stateId) {
            setTooltip(prev => ({
              ...prev,
              x: e.clientX,
              y: e.clientY
            }))
          }
        }
        
        stateElement.addEventListener('click', handleClick)
        stateElement.addEventListener('mouseenter', handleMouseEnter)
        stateElement.addEventListener('mouseleave', handleMouseLeave)
        stateElement.addEventListener('mousemove', handleMouseMove)
        
        // Cleanup function
        return () => {
          stateElement.removeEventListener('click', handleClick)
          stateElement.removeEventListener('mouseenter', handleMouseEnter)
          stateElement.removeEventListener('mouseleave', handleMouseLeave)
          stateElement.removeEventListener('mousemove', handleMouseMove)
        }
      }
    })
  }, [svgReady, onSelect, hoveredState])

  useEffect(() => {
    if (!svgReady || !mapRef.current) return
    
    const allStates = mapRef.current.querySelectorAll('path[id]')
    
    allStates.forEach((stateElement) => {
      const stateId = stateElement.id
      const stateName = stateIdToName[stateId]
      const isSelected = selected?.name === stateName || selected?.id === stateId
      const isHovered = hoveredState === stateId
      const hasData = stateName && indianStatesData[stateName]
      
      if (hasData) {
        // Color scheme for states with data (adapts to theme)
        if (isDark) {
          if (isSelected) {
            stateElement.style.fill = '#065f46' // Dark green for selected
          } else if (isHovered) {
            stateElement.style.fill = '#047857' // Medium green for hover
          } else {
            stateElement.style.fill = '#10b981' // Base green
          }
          stateElement.style.stroke = '#064e3b'
        } else {
          if (isSelected) {
            stateElement.style.fill = '#059669' // Emerald for selected
          } else if (isHovered) {
            stateElement.style.fill = '#10b981' // Light emerald for hover
          } else {
            stateElement.style.fill = '#34d399' // Base light green
          }
          stateElement.style.stroke = '#047857'
        }
        stateElement.style.strokeWidth = '1px'
      } else {
        // Gray for states without data
        if (isDark) {
          stateElement.style.fill = '#6b7280'
          stateElement.style.stroke = '#4b5563'
        } else {
          stateElement.style.fill = '#d1d5db'
          stateElement.style.stroke = '#9ca3af'
        }
        stateElement.style.strokeWidth = '0.5px'
        stateElement.style.cursor = 'default'
      }
    })
  }, [selected, svgReady, hoveredState, isDark])

  const applyTransform = () => {
    if (!mapRef.current) return
    const { x, y } = translateRef.current
    const s = scaleRef.current
    mapRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`
    mapRef.current.style.transformOrigin = '0 0'
  }

  const handleZoomIn = () => {
    scaleRef.current = Math.min(4, scaleRef.current * 1.2)
    applyTransform()
  }
  
  const handleZoomOut = () => {
    scaleRef.current = Math.max(0.5, scaleRef.current / 1.2)
    applyTransform()
  }
  
  const handleReset = () => {
    scaleRef.current = 1
    translateRef.current = { x: 0, y: 0 }
    applyTransform()
  }

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleReset()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    let dragging = false
    let start = { x: 0, y: 0 }
    
    const onDown = (e) => {
      dragging = true
      start = { x: e.clientX - translateRef.current.x, y: e.clientY - translateRef.current.y }
    }
    
    const onMove = (e) => {
      if (!dragging) return
      translateRef.current = { x: e.clientX - start.x, y: e.clientY - start.y }
      applyTransform()
    }
    
    const onUp = () => {
      dragging = false
    }
    
    containerRef.current.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    
    return () => {
      containerRef.current?.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div className="relative w-full select-none overflow-hidden rounded-lg" style={{ height }}>
      {/* Zoom Controls */}
      <div className={`absolute top-3 right-3 z-10 flex flex-col gap-2 ${isDark ? 'bg-neutral-900/80 border-neutral-700/50' : 'bg-white/80 border-gray-300'} backdrop-blur-sm rounded-xl p-2 border shadow-xl transition-colors duration-300`}>
        <button 
          onClick={handleZoomIn} 
          className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white flex items-center justify-center transition-all font-bold text-xl shadow-lg hover:shadow-xl hover:scale-110"
          title="Zoom In (+)"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white flex items-center justify-center transition-all font-bold text-xl shadow-lg hover:shadow-xl hover:scale-110"
          title="Zoom Out (-)"
        >
          −
        </button>
        <button 
          onClick={handleReset} 
          className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white flex items-center justify-center transition-all font-bold text-xl shadow-lg hover:shadow-xl hover:scale-110"
          title="Reset View (0)"
        >
          ⟲
        </button>
      </div>

      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading State */}
      {!svgReady && (
        <div className={`w-full h-full animate-pulse ${isDark ? 'bg-neutral-800/50' : 'bg-gray-200/50'} rounded-lg flex items-center justify-center transition-colors duration-300`}>
          <div className={isDark ? 'text-neutral-400' : 'text-gray-600'}>Loading map...</div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className={`fixed z-50 ${isDark ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100 border-emerald-500/50' : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border-emerald-500'} px-4 py-3 rounded-xl shadow-2xl border pointer-events-none backdrop-blur-sm font-semibold transition-colors duration-300`}
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}


