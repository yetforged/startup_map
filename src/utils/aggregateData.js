import indianStatesData from '../data/indian-states-data.json'

export function getCountryData() {
  const states = Object.values(indianStatesData)
  
  // Aggregate totals
  const totals = {
    total_startups: 0,
    unicorns_total: 0,
    women_led_total: 0
  }
  
  const startups_by_sector = {}
  const funding_by_sector = {}
  const startups_growth_yearly = {}
  const top_cities_by_startups = {}
  const startup_stage_distribution = {}
  const employment_data = {
    total_jobs: 0,
    avg_salary: 0,
    top_skills: []
  }
  
  let salarySum = 0
  let salaryCount = 0
  const skillsSet = new Set()
  
  states.forEach(state => {
    // Aggregate totals
    totals.total_startups += state.totals?.total_startups || 0
    totals.unicorns_total += state.totals?.unicorns_total || 0
    totals.women_led_total += state.totals?.women_led_total || 0
    
    // Aggregate sectors
    Object.entries(state.startups_by_sector || {}).forEach(([sector, count]) => {
      startups_by_sector[sector] = (startups_by_sector[sector] || 0) + count
    })
    
    // Aggregate funding
    Object.entries(state.funding_by_sector || {}).forEach(([sector, amount]) => {
      funding_by_sector[sector] = (funding_by_sector[sector] || 0) + amount
    })
    
    // Aggregate yearly growth
    Object.entries(state.startups_growth_yearly || {}).forEach(([year, count]) => {
      startups_growth_yearly[year] = (startups_growth_yearly[year] || 0) + count
    })
    
    // Aggregate cities
    Object.entries(state.top_cities_by_startups || {}).forEach(([city, count]) => {
      top_cities_by_startups[city] = (top_cities_by_startups[city] || 0) + count
    })
    
    // Aggregate stages
    Object.entries(state.startup_stage_distribution || {}).forEach(([stage, count]) => {
      startup_stage_distribution[stage] = (startup_stage_distribution[stage] || 0) + count
    })
    
    // Aggregate employment
    if (state.employment_data) {
      employment_data.total_jobs += state.employment_data.total_jobs || 0
      if (state.employment_data.avg_salary) {
        salarySum += state.employment_data.avg_salary
        salaryCount++
      }
      state.employment_data.top_skills?.forEach(skill => skillsSet.add(skill))
    }
  })
  
  // Calculate average salary
  employment_data.avg_salary = salaryCount > 0 ? Math.round(salarySum / salaryCount) : 0
  employment_data.top_skills = Array.from(skillsSet).slice(0, 10)
  
  // Get top 5 cities
  const topCities = Object.entries(top_cities_by_startups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .reduce((acc, [city, count]) => {
      acc[city] = count
      return acc
    }, {})
  
  return {
    fullName: 'India',
    totals,
    startups_by_sector,
    funding_by_sector,
    startups_growth_yearly,
    top_cities_by_startups: topCities,
    startup_stage_distribution,
    employment_data
  }
}
