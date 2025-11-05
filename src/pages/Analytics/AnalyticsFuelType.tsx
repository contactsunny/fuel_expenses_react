import { useEffect, useState } from 'react'
import { getFuelTypeAnalytics } from '../../services/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function AnalyticsFuelType() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    setLoading(true)
    getFuelTypeAnalytics(start, end)
      .then((res) => {
        const payload = (res.data?.data ?? res.data) as any
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
        const normalized = items.map((it: any) => ({
          type: it.type ?? it.name ?? 'Unknown',
          amount: Number(it.amount ?? it.value ?? 0),
        }))
        setData(normalized)
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fuel Type Analytics</h2>
      <div className="rounded-xl border border-slate-200 p-4">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && data.length === 0 && <div>No data</div>}
        {!loading && !error && data.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}


