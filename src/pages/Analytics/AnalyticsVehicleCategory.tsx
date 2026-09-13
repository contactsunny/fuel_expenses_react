import { useEffect, useState } from 'react'
import { Card, PageLoading, EmptyState, Alert } from '../../components/ui'
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

  const COLORS = ['#2563eb', '#60a5fa', '#0e9f6e', '#f59e0b', '#ef4444', '#6366f1', '#38bdf8', '#84cc16']

  const isMobile = screenWidth < 768
  const outerRadius = isMobile ? 80 : 120
  const innerRadius = isMobile ? 40 : 60

  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-semibold">{money.format(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="app-page space-y-5">
      <section className="app-hero p-5 md:p-7">
        <p className="app-eyebrow app-hero-muted">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Vehicle Category</h1>
        <p className="mt-2 text-sm app-hero-muted">Spend distribution by vehicle category.</p>
      </section>
      <Card padding={false} className="section-panel p-4 md:p-6">
        {loading && <PageLoading label="Loading…" />}
        {error && <Alert className="m-2">{error}</Alert>}
        {!loading && !error && data.length === 0 && (
          <EmptyState title="No data available" description="There is nothing to show for the last 6 months." />
        )}
        {!loading && !error && data.length > 0 && (
          <>
          <p className="mb-3 px-1 text-sm text-muted-foreground">
            Category spend for the last 6 months across {data.length} categories.
          </p>
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
          </>
        )}
      </Card>
    </div>
  )
}

