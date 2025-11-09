import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import indianStatesData from '../data/indian-states-data.json';
import { getCountryData } from '../utils/aggregateData';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

function useStateData(selectedStateName) {
  const key = (selectedStateName || '').trim();
  
  // If no state selected, return country data
  if (!key) {
    return getCountryData();
  }
  
  // Find state data
  const stateKey = Object.keys(indianStatesData).find(k => k.toLowerCase() === key.toLowerCase())
  if (stateKey && indianStatesData[stateKey]) {
    return indianStatesData[stateKey]
  }
  
  return null;
}

function ChartCard({ title, children, accentColor = 'emerald' }) {
  const { isDark } = useTheme()
  
  const accentColorsDark = {
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
  }
  
  const accentColorsLight = {
    emerald: 'from-emerald-100 to-emerald-50 border-emerald-300',
    purple: 'from-purple-100 to-purple-50 border-purple-300',
    blue: 'from-blue-100 to-blue-50 border-blue-300'
  }

  const colors = isDark ? accentColorsDark : accentColorsLight

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[accentColor]} backdrop-blur-sm p-5 h-full flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <h4 className={`text-sm font-bold ${isDark ? 'text-neutral-300' : 'text-gray-600'} mb-2 tracking-wide uppercase`}>{title}</h4>
      <div className="flex-grow">{children}</div>
    </div>
  );
}

function useTotals(selectedStateName) {
  const stateData = useStateData(selectedStateName);
  const totals = stateData?.totals || {};
  return {
    totalStartups: totals.total_startups ?? 0,
    unicorns: totals.unicorns_total ?? 0,
    womenLed: totals.women_led_total ?? 0,
  };
}

function StatTile({ title, value, color, icon, accentColor }) {
  return (
    <ChartCard title={title} accentColor={accentColor}>
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="text-4xl">{icon}</div>
        <div className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color }}>
          {Number(value).toLocaleString('en-IN')}
        </div>
      </div>
    </ChartCard>
  );
}

export default function StatsPanel({ selectedStateName }) {
    const { isDark } = useTheme()
    const { totalStartups, unicorns, womenLed } = useTotals(selectedStateName);
    const hasData = useStateData(selectedStateName);

    if (!hasData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ChartCard title="Total Startups" accentColor="emerald">
                    <div className={`flex items-center justify-center h-full ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
                        No data available
                    </div>
                </ChartCard>
                <ChartCard title="Unicorns" accentColor="purple">
                    <div className={`flex items-center justify-center h-full ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
                        No data available
                    </div>
                </ChartCard>
                <ChartCard title="Women-led Startups" accentColor="blue">
                    <div className={`flex items-center justify-center h-full ${isDark ? 'text-neutral-400' : 'text-gray-500'} font-medium`}>
                        No data available
                    </div>
                </ChartCard>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile title="Total Startups" value={totalStartups} color={isDark ? "#10b981" : "#059669"} icon="🚀" accentColor="emerald" />
            <StatTile title="Unicorns" value={unicorns} color={isDark ? "#a78bfa" : "#8b5cf6"} icon="🦄" accentColor="purple" />
            <StatTile title="Women-led Startups" value={womenLed} color={isDark ? "#60a5fa" : "#3b82f6"} icon="👩‍💼" accentColor="blue" />
        </div>
    );
}
