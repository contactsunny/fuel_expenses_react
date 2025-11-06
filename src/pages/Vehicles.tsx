import { useEffect, useState } from 'react'
import { getUserVehicles } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'

export default function Vehicles() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getUserVehicles(),
      getUserVehicleCategories(),
    ])
      .then(([vehiclesRes, catsRes]: any) => {
        const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data) as any
        const vehicles: any[] = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : []

        const catsPayload = (catsRes.data?.data ?? catsRes.data) as any
        const categories: any[] = Array.isArray(catsPayload) ? catsPayload : Array.isArray(catsPayload?.items) ? catsPayload.items : []

        // Create category map
        const categoryIdToName = new Map<string, string>()
        for (const c of categories) {
          const id = String(c.id ?? c._id ?? c.categoryId ?? '')
          const name = String(c.name ?? c.title ?? c.categoryName ?? 'Unknown')
          if (!id) continue
          categoryIdToName.set(id, name)
        }

        // Enrich vehicles with category names
        const enriched = vehicles.map((v: any) => {
          const categoryId = String(v.categoryId ?? v.vehicleCategoryId ?? v.category?.id ?? '')
          const categoryName = categoryId ? (categoryIdToName.get(categoryId) ?? '') : ''
          return { ...v, categoryName }
        })

        setRows(enriched)
      })
      .catch(() => setError('Failed to load vehicles'))
      .finally(() => setLoading(false))
  }, [])

  const isMobile = screenWidth < 768

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-slate-100">Vehicles</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0 overflow-hidden shadow-sm">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            {isMobile ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.length === 0 ? (
                  <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No vehicles</div>
                ) : (
                  rows.map((r: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        {r.categoryName && (
                          <div>
                            <span className="font-medium">Category:</span> {r.categoryName}
                          </div>
                        )}
                        {r.vehicleNumber && (
                          <div>
                            <span className="font-medium">Registration Number:</span> {r.vehicleNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left text-slate-600 dark:text-slate-300">
                    <th className="py-3 pl-4 pr-4">Name</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Registration Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {rows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 pl-4 pr-4 text-slate-900 dark:text-slate-100 font-medium">
                        {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                      </td>
                      <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                        {r.categoryName ?? ''}
                      </td>
                      <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                        {r.vehicleNumber ?? ''}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={3}>No vehicles</td>
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
