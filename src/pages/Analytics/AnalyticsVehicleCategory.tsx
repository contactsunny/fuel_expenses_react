import { useEffect, useState } from 'react'
import { getCategoryAnalytics } from '../../services/analytics'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AnalyticsVehicleCategory() {
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
    getCategoryAnalytics(start, end)
      .then((res) => {
        // API response format: { status, message, error, data: [{ vehicleCategoryId, vehicleCategoryName, total }] }
        const responseData = res.data?.data as any[]
        
        if (!Array.isArray(responseData)) {
          setError('Invalid data format')
          return
        }
        
        // Map vehicleCategoryName and total to name and value
        const normalized = responseData.map((it: any) => ({
          name: it.vehicleCategoryName ?? it.categoryName ?? 'Unknown',
          value: Number(it.total ?? 0)
        }))
        
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-slate-900 dark:text-slate-100">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Amount: <span className="font-semibold">{money.format(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-slate-100">Vehicle Category Analytics</h2>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-6">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && data.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">No data available</div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className={isMobile ? "h-96" : "h-96 md:h-[500px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
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
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
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


