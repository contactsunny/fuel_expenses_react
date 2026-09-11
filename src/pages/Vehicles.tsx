import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Car, Hash } from 'lucide-react'
import { getUserVehicles, deleteVehicle } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import VehicleForm from '../components/VehicleForm'
import { Card, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui'

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

  const actionButtons = (r: any) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(r)}
        className="h-8 w-8 text-accent"
        aria-label="Edit vehicle"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(r)}
        className="h-8 w-8 text-danger"
        aria-label="Delete vehicle"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <div className="app-page space-y-5">
      <section className="app-hero p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase app-hero-muted">Garage</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Vehicles</h1>
            <p className="mt-2 text-sm app-hero-muted">{rows.length} vehicles saved</p>
          </div>
          <Button
            onClick={() => {
              setEditingVehicle(null)
              setShowVehicleForm(true)
            }}
            className="hidden md:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        </div>
      </section>

      <Card padding={false} className="section-panel">
        {loading && <PageLoading />}
        {error && (
          <div className="p-4">
            <Alert>{error}</Alert>
          </div>
        )}
        {!loading && !error && (
          <>
            {rows.length === 0 ? (
              <EmptyState icon={<Car className="h-6 w-6" />} title="No vehicles" />
            ) : (
              <div className={isMobile ? "divide-y divide-border" : "grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3"}>
                {rows.map((r: any, idx: number) => (
                  <div key={idx} className={isMobile ? "mobile-record hover:bg-muted/50 transition-colors" : "entity-card p-4"}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
                          <Car className="h-5 w-5" />
                        </div>
                        <div className="mt-3 truncate font-semibold text-foreground">
                          {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                        </div>
                      </div>
                      {actionButtons(r)}
                    </div>
                    <dl className={isMobile ? "mobile-meta" : "mt-4 space-y-2 text-sm"}>
                      {r.categoryName && (
                        <>
                          <dt className={isMobile ? "" : "text-muted-foreground"}>Category</dt><dd className={isMobile ? "" : "text-foreground"}>{r.categoryName}</dd>
                        </>
                      )}
                      {r.vehicleNumber && (
                        <>
                          <dt className={isMobile ? "" : "flex items-center gap-1 text-muted-foreground"}>{!isMobile && <Hash className="h-3.5 w-3.5" />}Registration</dt><dd className={isMobile ? "" : "text-foreground"}>{r.vehicleNumber}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <button
        onClick={() => {
          setEditingVehicle(null)
          setShowVehicleForm(true)
        }}
        className="fixed z-40 w-14 h-14 bg-accent hover:brightness-105 text-accent-foreground rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-colors bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:hidden"
        aria-label="Add vehicle"
      >
        <Plus className="w-6 h-6" />
      </button>

      <VehicleForm
        isOpen={showVehicleForm}
        onClose={() => {
          setShowVehicleForm(false)
          setEditingVehicle(null)
        }}
        onSave={handleFormSave}
        vehicle={editingVehicle}
      />

      <Dialog
        open={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, vehicle: null })}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this vehicle? This action cannot be undone.
        </p>
        <DialogFooter className="border-t-0 pt-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteConfirm({ show: false, vehicle: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
