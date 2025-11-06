import { useEffect, useMemo, useState } from 'react'
import { getUserVehicleCategories } from '../services/vehicleCategories'

export default function Categories() {
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
    getUserVehicleCategories()
      .then((res: any) => {
        const payload = (res.data?.data ?? res.data) as any
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
        setRows(items)
      })
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  // Dynamically determine columns from the first row
  const columns = useMemo(() => {
    if (rows.length === 0) return []
    const firstRow = rows[0]
    const cols: Array<{ key: string; label: string }> = []
    
    // Check for common category fields
    if (firstRow.name !== undefined || firstRow.title !== undefined || firstRow.categoryName !== undefined) {
      cols.push({ key: 'name', label: 'Name' })
    }
    if (firstRow.description !== undefined) {
      cols.push({ key: 'description', label: 'Description' })
    }
    
    // If no standard fields found, show all non-empty fields from first row
    if (cols.length === 0) {
      Object.keys(firstRow).forEach(key => {
        if (firstRow[key] !== null && firstRow[key] !== undefined && firstRow[key] !== '') {
          cols.push({ key, label: key.charAt(0).toUpperCase() + key.slice(1) })
        }
      })
    }
    
    return cols
  }, [rows])

  const getValue = (row: any, col: { key: string; label: string }) => {
    switch (col.key) {
      case 'name':
        return row.name ?? row.title ?? row.categoryName ?? ''
      default:
        return row[col.key] ?? ''
    }
  }

  const isMobile = screenWidth < 768

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-slate-100">Categories</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0 overflow-hidden shadow-sm">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            {isMobile ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.length === 0 ? (
                  <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No categories</div>
                ) : (
                  rows.map((r: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {r.name ?? r.title ?? r.categoryName ?? 'Unnamed Category'}
                      </div>
                      {columns.filter(c => c.key !== 'name').map(col => {
                        const val = getValue(r, col)
                        return val ? (
                          <div key={col.key} className="text-sm text-slate-600 dark:text-slate-400">
                            {val}
                          </div>
                        ) : null
                      })}
                    </div>
                  ))
                )}
              </div>
            ) : (
              columns.length > 0 ? (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr className="text-left text-slate-600 dark:text-slate-300">
                      {columns.map(col => (
                        <th key={col.key} className="py-3 pl-4 pr-4">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        {columns.map(col => (
                          <td key={col.key} className="py-3 pl-4 pr-4 text-slate-700 dark:text-slate-300">
                            {col.key === 'name' ? (
                              <span className="font-medium text-slate-900 dark:text-slate-100">{getValue(r, col)}</span>
                            ) : (
                              getValue(r, col)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No categories</div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
