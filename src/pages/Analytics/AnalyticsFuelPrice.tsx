import { useEffect, useState } from 'react'
import { getFuelPriceAnalytics } from '../../services/analytics'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function AnalyticsFuelPrice() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    setLoading(true)
    getFuelPriceAnalytics(start, end)
      .then((res) => {
        // API response format: { status, message, error, data: { PETROL: [...], DIESEL: [...] } }
        const dataObj = res.data?.data as any
        
        // Log the response for debugging
        if (import.meta.env.DEV) {
          console.log('Fuel Price Analytics API Response:', res.data)
        }
        
        if (!dataObj || typeof dataObj !== 'object') {
          console.error('Unexpected API response format:', res.data)
          setError('Invalid data format. Check console for details.')
          return
        }
        
        const petrolData = Array.isArray(dataObj.PETROL) ? dataObj.PETROL : []
        const dieselData = Array.isArray(dataObj.DIESEL) ? dataObj.DIESEL : []
        
        if (petrolData.length === 0 && dieselData.length === 0) {
          setData([])
          return
        }
        
        // Helper function to construct date string from date, month, year
        const constructDate = (it: any): string => {
          const day = String(it.date ?? it.day ?? '').padStart(2, '0')
          const month = String(it.month ?? '').padStart(2, '0')
          const year = String(it.year ?? '')
          
          if (day && month && year) {
            // Format as "dd MMM" for display (e.g., "06 Jun")
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthIndex = parseInt(month, 10) - 1
            const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month
            return `${day} ${monthName}`
          }
          // Fallback to existing date field if available
          return it.date ?? it.day ?? it.label ?? it.period ?? it.time ?? ''
        }
        
        // Helper function to get cost value
        const getCost = (it: any): number => {
          return Number(it.cost ?? it.price ?? it.value ?? it.amount ?? 0)
        }
        
        // Get all unique dates from both arrays
        const allDates = new Set<string>()
        petrolData.forEach((it: any) => {
          const date = constructDate(it)
          if (date) allDates.add(date)
        })
        dieselData.forEach((it: any) => {
          const date = constructDate(it)
          if (date) allDates.add(date)
        })
        
        // Create a map for quick lookup
        const petrolMap = new Map<string, number>()
        petrolData.forEach((it: any) => {
          const date = constructDate(it)
          const cost = getCost(it)
          if (date) petrolMap.set(date, cost)
        })
        
        const dieselMap = new Map<string, number>()
        dieselData.forEach((it: any) => {
          const date = constructDate(it)
          const cost = getCost(it)
          if (date) dieselMap.set(date, cost)
        })
        
        // Helper function to create sort key from date string (dd MMM format)
        const createSortKey = (dateStr: string): string => {
          // Find the original data point to get year, month, day
          const found = [...petrolData, ...dieselData].find((it: any) => {
            const day = String(it.date ?? it.day ?? '').padStart(2, '0')
            const month = String(it.month ?? '').padStart(2, '0')
            const year = String(it.year ?? '')
            if (day && month && year) {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const monthIndex = parseInt(month, 10) - 1
              const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month
              const formatted = `${day} ${monthName}`
              return formatted === dateStr
            }
            return false
          })
          
          if (found) {
            const day = String(found.date ?? found.day ?? '').padStart(2, '0')
            const month = String(found.month ?? '').padStart(2, '0')
            const year = String(found.year ?? '')
            return `${year}${month}${day}`
          }
          return dateStr
        }
        
        // Combine data by date and sort chronologically
        const normalized = Array.from(allDates).map((date) => {
          const entry: any = { date }
          entry.petrol = petrolMap.get(date) ?? null
          if (dieselData.length > 0) {
            entry.diesel = dieselMap.get(date) ?? null
          }
          // Store sort key for chronological sorting
          entry._sortKey = createSortKey(date)
          return entry
        }).sort((a, b) => {
          // Sort by date chronologically
          if (a._sortKey < b._sortKey) return -1
          if (a._sortKey > b._sortKey) return 1
          return 0
        }).map(({ _sortKey, ...entry }) => entry) // Remove sort key from final data
        
        setData(normalized)
      })
      .catch((err) => {
        console.error('Analytics error:', err)
        setError('Failed to load analytics')
      })
      .finally(() => setLoading(false))
  }, [])

  const isMobile = screenWidth < 768
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

  // Calculate intelligent Y-axis range
  const calculateYAxisDomain = () => {
    if (data.length === 0) return [0, 100]
    
    // Get all values (petrol and diesel)
    const allValues: number[] = []
    data.forEach((d: any) => {
      if (d.petrol !== null && d.petrol !== undefined) allValues.push(d.petrol)
      if (d.diesel !== null && d.diesel !== undefined) allValues.push(d.diesel)
    })
    
    if (allValues.length === 0) return [0, 100]
    
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    
    // Add padding (10% on top and bottom)
    const range = maxValue - minValue
    const padding = range * 0.1
    
    // Round to nice numbers
    const minDomain = Math.max(0, Math.floor((minValue - padding) / 10) * 10)
    const maxDomain = Math.ceil((maxValue + padding) / 10) * 10
    
    return [minDomain, maxDomain]
  }

  const yAxisDomain = calculateYAxisDomain()

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">{data.date}</p>
          <div className="space-y-1 text-sm">
            {data.petrol !== null && data.petrol !== undefined && (
              <p className="text-slate-600 dark:text-slate-400">
                Petrol: <span className="font-semibold text-slate-900 dark:text-slate-100">{money.format(data.petrol)}</span>
              </p>
            )}
            {data.diesel !== null && data.diesel !== undefined && (
              <p className="text-slate-600 dark:text-slate-400">
                Diesel: <span className="font-semibold text-slate-900 dark:text-slate-100">{money.format(data.diesel)}</span>
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-slate-100">Fuel Price Analytics</h2>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-6">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && data.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">No data available</div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className={isMobile ? "h-80" : "h-96 md:h-[500px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: isMobile ? 8 : 12, right: isMobile ? 8 : 12, top: 12, bottom: isMobile ? 8 : 12 }}>
                <defs>
                  <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis 
                  dataKey="date" 
                  interval={isMobile ? Math.max(0, Math.floor(data.length / 6)) : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 30}
                  tick={{ fontSize: isMobile ? 9 : 11 }}
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                />
                <YAxis 
                  domain={yAxisDomain}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Area 
                  type="monotone" 
                  dataKey="petrol" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fill="url(#colorPetrol)"
                  name="Petrol"
                />
                {data.some((d: any) => d.diesel !== null && d.diesel !== undefined) && (
                  <Area 
                    type="monotone" 
                    dataKey="diesel" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fill="url(#colorDiesel)"
                    name="Diesel"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}


