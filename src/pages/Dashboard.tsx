import { useEffect, useMemo, useState } from 'react'
import { getUserFuel } from '../services/fuel'

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }), [])
  const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }), [])

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 3)
    setLoading(true)
    getUserFuel(start, end)
      .then((res: any) => {
        const payload = (res.data?.data ?? res.data) as any
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
        setRows(items)
      })
      .catch(() => setError('Failed to load records'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Records</h2>
        <div className="text-sm text-slate-500">Last 3 months</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-0 overflow-hidden shadow-sm">
        {loading && <div className="p-8 text-center text-slate-500">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-600">
                <th className="py-3 pl-4 pr-4">Date</th>
                <th className="py-3 pr-4">Vehicle</th>
                <th className="py-3 pr-4">Fuel Type</th>
                <th className="py-3 pr-4">Volume</th>
                <th className="py-3 pr-4">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r: any, idx: number) => {
                const dateVal = r.date ?? r.createdAt ?? ''
                const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 pl-4 pr-4 whitespace-nowrap">{isNaN(date.getTime()) ? '' : fmt.format(date)}</td>
                    <td className="py-3 pr-4">{r.vehicleName ?? r.vehicle ?? ''}</td>
                    <td className="py-3 pr-4"><span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{r.fuelType ?? r.type ?? ''}</span></td>
                    <td className="py-3 pr-4">{r.volume ?? r.quantity ?? ''}</td>
                    <td className="py-3 pr-4">{typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="py-6 text-slate-500 text-center" colSpan={5}>No records</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


