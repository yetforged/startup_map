import { useRef } from 'react'
import indianStatesData from '../data/indian-states-data.json'
import { getCountryData } from '../utils/aggregateData'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { useTheme } from '../contexts/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

function useStateData(selectedStateName) {
  const key = (selectedStateName || '').trim()
  
  // If no state selected, return country data
  if (!key) {
    return getCountryData()
  }
  
  // Find state data
  const stateKey = Object.keys(indianStatesData).find(k => k.toLowerCase() === key.toLowerCase())
  if (stateKey && indianStatesData[stateKey]) {
    return indianStatesData[stateKey]
  }
  
  return null
}

function ChartCard({ title, children, onDownload, chartRef, accentColor = 'blue' }) {
  const { isDark } = useTheme()
  
  const downloadSVG = () => {
    if (!chartRef?.current) return
    
    const canvas = chartRef.current.canvas
    
    // Create SVG
    const svgWidth = canvas.width
    const svgHeight = canvas.height
    
    const svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${isDark ? '#171717' : '#ffffff'}"/>
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <canvas width="${svgWidth}" height="${svgHeight}"></canvas>
          </div>
        </foreignObject>
        <image href="${canvas.toDataURL()}" width="${svgWidth}" height="${svgHeight}"/>
        <text x="10" y="30" fill="${isDark ? '#d4d4d8' : '#1f2937'}" font-family="Arial" font-size="16" font-weight="bold">${title}</text>
      </svg>
    `
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    onDownload?.()
  }

  const accentColorsDark = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
  }

  const accentColorsLight = {
    blue: 'from-blue-100 to-blue-50 border-blue-300',
    purple: 'from-purple-100 to-purple-50 border-purple-300',
    orange: 'from-orange-100 to-orange-50 border-orange-300',
    emerald: 'from-emerald-100 to-emerald-50 border-emerald-300'
  }

  const colors = isDark ? accentColorsDark : accentColorsLight

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[accentColor]} backdrop-blur-sm p-5 h-full flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-base font-bold ${isDark ? 'text-neutral-100' : 'text-gray-800'} tracking-wide`}>{title}</h4>
        <button
          onClick={downloadSVG}
          className={`${isDark ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'} transition-all p-2 rounded-lg hover:scale-110`}
          title="Download as SVG"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
      <div className="flex-grow relative">
        {children}
      </div>
    </div>
  )
}

function ChartFunding({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const labels = Object.keys(stateData?.funding_by_sector || {})
  const values = Object.values(stateData?.funding_by_sector || {})
  
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8']
  
  const data = {
    labels,
    datasets: [{ 
      label: '₹ crores', 
      data: values, 
      backgroundColor: colors.slice(0, labels.length), 
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#1e40af'
    }],
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb', display: false } 
      },
      y: { 
        ticks: { 
          color: isDark ? '#e5e7eb' : '#374151', 
          font: { size: 12, weight: '600' },
          callback: (v) => `₹${Number(v).toLocaleString('en-IN')}` 
        }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb' } 
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    },
  }

  if (!stateData || !labels.length) {
    return (
      <ChartCard title="💰 Funding by Sector" chartRef={chartRef} accentColor="blue">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          No funding data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="💰 Funding by Sector" chartRef={chartRef} accentColor="blue">
      <div className="h-64">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </ChartCard>
  )
}

function ChartGrowth({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const labels = Object.keys(stateData?.startups_growth_yearly || {})
  const values = Object.values(stateData?.startups_growth_yearly || {})
  
  const data = {
    labels,
    datasets: [{ 
      label: 'Startups', 
      data: values, 
      borderColor: '#f97316', 
      backgroundColor: 'rgba(249, 115, 22, 0.2)', 
      tension: 0.4, 
      fill: true,
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: '#f97316',
      pointBorderColor: isDark ? '#fff' : '#000',
      pointBorderWidth: 2,
      pointHoverRadius: 7
    }],
  }
  
  const options = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#f97316',
        borderWidth: 1
      }
    }, 
    scales: { 
      x: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb', display: false } 
      }, 
      y: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb' } 
      } 
    } 
  }

  if (!stateData || !labels.length) {
    return (
      <ChartCard title="📈 Startup Growth Over Years" chartRef={chartRef} accentColor="orange">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          No growth data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="📈 Startup Growth Over Years" chartRef={chartRef} accentColor="orange">
      <div className="h-64">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </ChartCard>
  )
}

function ChartTopCities({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const entries = Object.entries(stateData?.top_cities_by_startups || {}).sort((a, b) => b[1] - a[1])
  const labels = entries.map(([k]) => k)
  const values = entries.map(([, v]) => v)
  
  const data = { 
    labels, 
    datasets: [{ 
      label: 'Startups', 
      data: values, 
      backgroundColor: '#10b981', 
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#059669'
    }] 
  }
  
  const options = { 
    indexAxis: 'y', 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#10b981',
        borderWidth: 1
      }
    }, 
    scales: { 
      x: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb' } 
      }, 
      y: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb', display: false } 
      } 
    } 
  }

  if (!stateData || !labels.length) {
    return (
      <ChartCard title="🏙️ Top Cities by Startup Count" chartRef={chartRef} accentColor="emerald">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          No city data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="🏙️ Top Cities by Startup Count" chartRef={chartRef} accentColor="emerald">
      <div className="h-64"><Bar ref={chartRef} data={data} options={options} /></div>
    </ChartCard>
  )
}

function ChartStartupsBySector({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const labels = Object.keys(stateData?.startups_by_sector || {})
  const values = Object.values(stateData?.startups_by_sector || {})
  
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9']
  
  const data = { 
    labels, 
    datasets: [{ 
      data: values, 
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 3,
      borderColor: isDark ? '#1f2937' : '#ffffff',
      hoverBorderWidth: 4,
      hoverBorderColor: isDark ? '#fff' : '#000'
    }] 
  }
  
  const options = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { 
        display: true,
        position: 'bottom',
        labels: { 
          color: isDark ? '#e5e7eb' : '#374151', 
          font: { size: 12, weight: '600' },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#8b5cf6',
        borderWidth: 1
      }
    }
  }

  if (!stateData || !labels.length) {
    return (
      <ChartCard title="🎯 Startups by Sector" chartRef={chartRef} accentColor="purple">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          No sector data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="🎯 Startups by Sector" chartRef={chartRef} accentColor="purple">
      <div className="h-64"><Doughnut ref={chartRef} data={data} options={options} /></div>
    </ChartCard>
  )
}

function ChartStageDistribution({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const entries = Object.entries(stateData?.startup_stage_distribution || {})
  const labels = entries.map(([k]) => k)
  const values = entries.map(([, v]) => v)
  
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb']
  
  const data = { 
    labels, 
    datasets: [{ 
      label: 'Startups', 
      data: values, 
      backgroundColor: colors.slice(0, labels.length), 
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#1e40af'
    }] 
  }
  
  const options = { 
    indexAxis: 'y', 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    }, 
    scales: { 
      x: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb' } 
      }, 
      y: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb', display: false } 
      } 
    } 
  }

  if (!stateData || !labels.length) {
    return (
      <ChartCard title="🚀 Stage Distribution" chartRef={chartRef} accentColor="blue">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          No stage data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="🚀 Stage Distribution" chartRef={chartRef} accentColor="blue">
      <div className="h-64"><Bar ref={chartRef} data={data} options={options} /></div>
    </ChartCard>
  )
}

function ChartEmploymentData({ selectedStateName }) {
  const { isDark } = useTheme()
  const chartRef = useRef(null)
  const stateData = useStateData(selectedStateName)
  const employmentData = stateData?.employment_data

  if (!stateData || !employmentData) {
    return (
      <ChartCard title="👔 Career Insights" chartRef={chartRef} accentColor="emerald">
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
          Select a state to view employment data
        </div>
      </ChartCard>
    )
  }
  
  const data = {
    labels: ['Total Jobs', 'Avg Salary (₹)', 'Top Skills Count'],
    datasets: [{
      label: 'Employment Metrics',
      data: [
        employmentData.total_jobs / 1000, // Convert to thousands
        employmentData.avg_salary / 100000, // Convert to lakhs
        employmentData.top_skills?.length || 0
      ],
      backgroundColor: ['#10b981', '#059669', '#047857'],
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#065f46'
    }]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: '#10b981',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label
            const value = context.raw
            if (label === 'Total Jobs') return `${(value * 1000).toLocaleString()} jobs`
            if (label === 'Avg Salary (₹)') return `₹${(value * 100000).toLocaleString()}`
            return `${value} skills`
          }
        }
      }
    },
    scales: {
      x: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb', display: false } 
      },
      y: { 
        ticks: { color: isDark ? '#e5e7eb' : '#374151', font: { size: 12, weight: '600' } }, 
        grid: { color: isDark ? '#374151' : '#e5e7eb' } 
      }
    }
  }

  return (
    <ChartCard title="👔 Career Insights" chartRef={chartRef} accentColor="emerald">
      <div className="h-64"><Bar ref={chartRef} data={data} options={options} /></div>
    </ChartCard>
  )
}



export default function ChartsPanel({ selectedStateName }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartGrowth selectedStateName={selectedStateName} />
      <ChartFunding selectedStateName={selectedStateName} />
      <ChartTopCities selectedStateName={selectedStateName} />
      <ChartStartupsBySector selectedStateName={selectedStateName} />
      <ChartStageDistribution selectedStateName={selectedStateName} />
      <ChartEmploymentData selectedStateName={selectedStateName} />
    </div>
  )
}


