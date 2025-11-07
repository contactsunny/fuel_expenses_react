import { useEffect, useState } from 'react'
import { getFuelTypeAnalytics } from '../../services/analytics'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AnalyticsFuelType() {
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
    getFuelTypeAnalytics(start, end)
      .then((res) => {
        // API response format: { status, message, error, data: [{ year, month, petrolCost, dieselCost }] }
        const responseData = res.data?.data as any[]
        
        if (!Array.isArray(responseData)) {
          console.error('Unexpected API response format:', res.data)
          setError('Invalid data format. Check console for details.')
          return
        }
        
        if (responseData.length === 0) {
          setData([])
          return
        }
        
        // Helper function to construct date string from year, month
        const constructDate = (it: any): string => {
          const month = String(it.month ?? '').padStart(2, '0')
          const year = String(it.year ?? '')
          
          if (month && year) {
            // Format as "MMM YYYY" for display (e.g., "Jun 2025")
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthIndex = parseInt(month, 10) - 1
            const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month
            return `${monthName} ${year}`
          }
          return `${month}/${year}`
        }
        
        // Transform data to have petrolCost and dieselCost for each date
        const normalized = responseData.map((it: any) => {
          const date = constructDate(it)
          const petrolCost = Number(it.petrolCost ?? 0)
          const dieselCost = Number(it.dieselCost ?? 0)
          
          return {
            date,
            petrolCost,
            dieselCost,
            _sortKey: `${it.year}${String(it.month ?? '').padStart(2, '0')}`
          }
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

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

  const isMobile = screenWidth < 768
  const outerRadius = isMobile ? 80 : 120
  const innerRadius = isMobile ? 40 : 60

  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  // Aggregate total petrol and diesel costs across all dates
  const totalPetrolCost = data.reduce((sum, item: any) => sum + (item.petrolCost || 0), 0)
  const totalDieselCost = data.reduce((sum, item: any) => sum + (item.dieselCost || 0), 0)

  // Create chart data - total Petrol vs total Diesel
  const chartData = []
  if (totalPetrolCost > 0) {
    chartData.push({
      name: 'Petrol',
      value: Math.round(totalPetrolCost),
      type: 'Petrol'
    })
  }
  if (totalDieselCost > 0) {
    chartData.push({
      name: 'Diesel',
      value: Math.round(totalDieselCost),
      type: 'Diesel'
    })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total: <span className="font-semibold">{money.format(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-slate-100">Fuel Type Analytics</h2>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-6">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && chartData.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">No data available</div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <div className={isMobile ? "h-96" : "h-96 md:h-[500px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={outerRadius}
                  innerRadius={innerRadius}
                  paddingAngle={2}
                  label={({ name, value }: any) => `${name}: ₹${Math.round(value).toLocaleString('en-IN')}`}
                  labelLine={false}
                >
                  {chartData.map((entry: any, index: number) => {
                    // Use blue for Petrol, green for Diesel
                    const color = entry.type === 'Petrol' ? COLORS[0] : COLORS[1]
                    return <Cell key={index} fill={color} />
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign={isMobile ? "bottom" : "middle"}
                  align={isMobile ? "center" : "right"}
                  layout={isMobile ? "horizontal" : "vertical"}
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}


