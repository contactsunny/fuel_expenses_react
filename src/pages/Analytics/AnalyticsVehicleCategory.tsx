import { useEffect, useState } from 'react'
import { getCategoryAnalytics } from '../../services/analytics'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AnalyticsVehicleCategory() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    setLoading(true)
    getCategoryAnalytics(start, end)
      .then((res) => {
        const payload = (res.data?.data ?? res.data) as any
        // Expecting something like [{ name, value }] or convert
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : []
        const normalized = items.map((it: any) => ({ name: it.name ?? it.category ?? 'Unknown', value: Number(it.value ?? it.amount ?? 0) }))
        setData(normalized)
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Vehicle Category Analytics</h2>
      <div className="rounded-xl border border-slate-200 p-4">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && data.length === 0 && <div>No data</div>}
        {!loading && !error && data.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}


