import { useEffect, useState } from 'react'
import { getUserVehicles, deleteVehicle } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import VehicleForm from '../components/VehicleForm'

export default function Vehicles() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; vehicle: any | null }>({ show: false, vehicle: null })
  const [deleting, setDeleting] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
  }, [refreshTrigger])

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setShowVehicleForm(true)
  }

  const handleDelete = (vehicle: any) => {
    setDeleteConfirm({ show: true, vehicle })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.vehicle) return
    
    const vehicleId = deleteConfirm.vehicle.id ?? deleteConfirm.vehicle._id
    if (!vehicleId) {
      setDeleteConfirm({ show: false, vehicle: null })
      return
    }

    setDeleting(true)
    try {
      await deleteVehicle(String(vehicleId))
      setRefreshTrigger(prev => prev + 1)
      setDeleteConfirm({ show: false, vehicle: null })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete vehicle')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1)
  }

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
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            aria-label="Edit vehicle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete vehicle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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
                    <th className="py-3 pr-4">Actions</th>
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
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            aria-label="Edit vehicle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete vehicle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={4}>No vehicles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setEditingVehicle(null)
          setShowVehicleForm(true)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-colors"
        aria-label="Add vehicle"
      >
        +
      </button>

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={showVehicleForm}
        onClose={() => {
          setShowVehicleForm(false)
          setEditingVehicle(null)
        }}
        onSave={handleFormSave}
        vehicle={editingVehicle}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirm({ show: false, vehicle: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold dark:text-slate-100 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, vehicle: null })}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
