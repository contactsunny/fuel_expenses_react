import { useEffect, useState } from 'react'
import { getFuelPriceAnalytics } from '../../services/analytics'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function AnalyticsFuelPrice() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    setLoading(true)
    getFuelPriceAnalytics(start, end)
      .then((res) => {
        const payload = (res.data?.data ?? res.data) as any
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
        const normalized = items.map((it: any) => ({
          date: it.date ?? it.day ?? it.label ?? '',
          price: Number(it.price ?? it.value ?? 0),
        }))
        setData(normalized)
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fuel Price Analytics</h2>
      <div className="rounded-xl border border-slate-200 p-4">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && data.length === 0 && <div>No data</div>}
        {!loading && !error && data.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}


