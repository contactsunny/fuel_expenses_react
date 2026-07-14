import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { getUserVehicleCategories, deleteVehicleCategory } from '../services/vehicleCategories'
import CategoryForm from '../components/CategoryForm'
import { Card, PageHeader, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui'

export default function Categories() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; category: any | null }>({ show: false, category: null })
  const [deleting, setDeleting] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
  }, [refreshTrigger])

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleDelete = (category: any) => {
    setDeleteConfirm({ show: true, category })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.category) return
    
    const categoryId = deleteConfirm.category.id ?? deleteConfirm.category._id
    if (!categoryId) {
      setDeleteConfirm({ show: false, category: null })
      return
    }

    setDeleting(true)
    try {
      await deleteVehicleCategory(String(categoryId))
      setRefreshTrigger(prev => prev + 1)
      setDeleteConfirm({ show: false, category: null })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1)
  }

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

  const actionButtons = (r: any) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(r)}
        className="p-1.5 text-accent hover:bg-accent-muted rounded-lg transition-colors"
        aria-label="Edit category"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(r)}
        className="p-1.5 text-danger hover:bg-danger-muted rounded-lg transition-colors"
        aria-label="Delete category"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Categories" />

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
              <EmptyState icon={<Tags className="h-6 w-6" />} title="No categories" />
            ) : isMobile ? (
              <div className="divide-y divide-border">
                {rows.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-foreground">
                        {r.name ?? r.title ?? r.categoryName ?? 'Unnamed Category'}
                      </div>
                      {actionButtons(r)}
                    </div>
                    {columns.filter(c => c.key !== 'name').map(col => {
                      const val = getValue(r, col)
                      return val ? (
                        <div key={col.key} className="text-sm text-muted-foreground">
                          {val}
                        </div>
                      ) : null
                    })}
                  </div>
                ))}
              </div>
            ) : (
              columns.length > 0 ? (
                <table className="min-w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr className="text-left text-muted-foreground">
                      {columns.map(col => (
                        <th key={col.key} className="py-3 pl-4 pr-4 font-medium">{col.label}</th>
                      ))}
                      <th className="py-3 pr-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        {columns.map(col => (
                          <td key={col.key} className="py-3 pl-4 pr-4 text-muted-foreground">
                            {col.key === 'name' ? (
                              <span className="font-medium text-foreground">{getValue(r, col)}</span>
                            ) : (
                              getValue(r, col)
                            )}
                          </td>
                        ))}
                        <td className="py-3 pr-4">
                          {actionButtons(r)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState icon={<Tags className="h-6 w-6" />} title="No categories" />
              )
            )}
          </>
        )}
      </Card>

      <button
        onClick={() => {
          setEditingCategory(null)
          setShowCategoryForm(true)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:brightness-110 text-accent-foreground rounded-full shadow-lg flex items-center justify-center z-40 transition-colors"
        aria-label="Add category"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false)
          setEditingCategory(null)
        }}
        onSave={handleFormSave}
        category={editingCategory}
      />

      <Dialog
        open={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, category: null })}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
        <DialogFooter className="border-t-0 pt-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteConfirm({ show: false, category: null })}
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
