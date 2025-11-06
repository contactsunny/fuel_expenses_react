import { useEffect, useMemo, useState } from 'react'
import { getUserFuel } from '../services/fuel'
import { getUserVehicles } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }), [])
  const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }), [])

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 3)
    setLoading(true)

    Promise.all([
      getUserFuel(start, end),
      getUserVehicles(),
      getUserVehicleCategories(),
    ])
      .then(([fuelRes, vehiclesRes, catsRes]: any) => {
        const fuelPayload = (fuelRes.data?.data ?? fuelRes.data) as any
        const fuelItems: any[] = Array.isArray(fuelPayload) ? fuelPayload : Array.isArray(fuelPayload?.items) ? fuelPayload.items : []

        const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data) as any
        const vehicles: any[] = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : []

        const catsPayload = (catsRes.data?.data ?? catsRes.data) as any
        const categories: any[] = Array.isArray(catsPayload) ? catsPayload : Array.isArray(catsPayload?.items) ? catsPayload.items : []

        const vehicleIdToVehicle = new Map<string, any>()
        for (const v of vehicles) {
          const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
          if (!id) continue
          vehicleIdToVehicle.set(id, v)
        }

        const categoryIdToName = new Map<string, string>()
        for (const c of categories) {
          const id = String(c.id ?? c._id ?? c.categoryId ?? '')
          const name = String(c.name ?? c.title ?? c.categoryName ?? 'Unknown')
          if (!id) continue
          categoryIdToName.set(id, name)
        }

        const enriched = fuelItems.map((r: any) => {
          const vehicleId = String(r.vehicleId ?? r.vehicle?.id ?? r.vehicle?.vehicleId ?? '')
          const vehicle = vehicleId ? vehicleIdToVehicle.get(vehicleId) : undefined
          const vehicleName = r.vehicleName ?? r.vehicle?.name ?? vehicle?.name ?? vehicle?.vehicleName ?? ''

          const categoryId = String(
            r.vehicleCategoryId ?? r.categoryId ?? r.vehicle?.categoryId ?? vehicle?.categoryId ?? ''
          )
          const categoryName = categoryId ? (categoryIdToName.get(categoryId) ?? '') : ''

          return { ...r, vehicleName, vehicleCategoryName: categoryName }
        })

        setRows(enriched)
      })
      .catch(() => setError('Failed to load records'))
      .finally(() => setLoading(false))
  }, [])

  const isMobile = screenWidth < 768

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-slate-100">Records</h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">Last 3 months</div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0 overflow-hidden shadow-sm">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            {isMobile ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.length === 0 ? (
                  <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No records</div>
                ) : (
                  rows.map((r: any, idx: number) => {
                    const dateVal = r.date ?? r.createdAt ?? ''
                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                    return (
                      <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{isNaN(date.getTime()) ? '' : fmt.format(date)}</div>
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{r.fuelType ?? r.type ?? ''}</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <div><span className="font-medium">Vehicle:</span> {r.vehicleName ?? r.vehicle ?? ''}</div>
                          <div><span className="font-medium">Category:</span> {r.vehicleCategoryName ?? ''}</div>
                          <div><span className="font-medium">Volume:</span> {r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''} L</div>
                          <div><span className="font-medium">Price:</span> {typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left text-slate-600 dark:text-slate-300">
                    <th className="py-3 pl-4 pr-4">Date</th>
                    <th className="py-3 pr-4">Vehicle</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Fuel Type</th>
                    <th className="py-3 pr-4">Volume (L)</th>
                    <th className="py-3 pr-4">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {rows.map((r: any, idx: number) => {
                    const dateVal = r.date ?? r.createdAt ?? ''
                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 pl-4 pr-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{isNaN(date.getTime()) ? '' : fmt.format(date)}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.vehicleName ?? r.vehicle ?? ''}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.vehicleCategoryName ?? ''}</td>
                        <td className="py-3 pr-4"><span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{r.fuelType ?? r.type ?? ''}</span></td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</td>
                      </tr>
                    )
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={6}>No records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}
