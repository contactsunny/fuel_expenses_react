import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { getUserVehicles, deleteVehicle } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import VehicleForm from '../components/VehicleForm'
import { Card, PageHeader, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui'

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
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(r)}
        className="p-1.5 text-accent hover:bg-accent-muted rounded-lg transition-colors"
        aria-label="Edit vehicle"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(r)}
        className="p-1.5 text-danger hover:bg-danger-muted rounded-lg transition-colors"
        aria-label="Delete vehicle"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Vehicles" />

      <Card padding={false} className="overflow-hidden">
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
            ) : isMobile ? (
              <div className="divide-y divide-border">
                {rows.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-foreground">
                        {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                      </div>
                      {actionButtons(r)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {r.categoryName && (
                        <div>
                          <span className="font-medium text-foreground">Category:</span> {r.categoryName}
                        </div>
                      )}
                      {r.vehicleNumber && (
                        <div>
                          <span className="font-medium text-foreground">Registration Number:</span> {r.vehicleNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr className="text-left text-muted-foreground">
                    <th className="py-3 pl-4 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Category</th>
                    <th className="py-3 pr-4 font-medium">Registration Number</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 pl-4 pr-4 text-foreground font-medium">
                        {r.name ?? r.vehicleName ?? 'Unnamed Vehicle'}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {r.categoryName ?? ''}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {r.vehicleNumber ?? ''}
                      </td>
                      <td className="py-3 pr-4">
                        {actionButtons(r)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Card>

      <button
        onClick={() => {
          setEditingVehicle(null)
          setShowVehicleForm(true)
        }}
        className="fixed z-40 w-14 h-14 bg-accent hover:brightness-110 text-accent-foreground rounded-full shadow-lg flex items-center justify-center transition-colors bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-[calc(1.5rem+env(safe-area-inset-right,0px))]"
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
