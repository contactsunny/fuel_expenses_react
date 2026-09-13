import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Tags, FileText } from 'lucide-react'
import { getUserVehicleCategories, deleteVehicleCategory } from '../services/vehicleCategories'
import CategoryForm from '../components/CategoryForm'
import { Card, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui'

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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(r)}
        className="h-8 w-8 text-accent"
        aria-label="Edit category"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(r)}
        className="h-8 w-8 text-danger"
        aria-label="Delete category"
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
            <p className="app-eyebrow app-hero-muted">Organization</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Categories</h1>
            <p className="mt-2 text-sm app-hero-muted">{rows.length} categories available</p>
          </div>
          <Button
            onClick={() => {
              setEditingCategory(null)
              setShowCategoryForm(true)
            }}
            className="hidden md:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add category
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
              <EmptyState icon={<Tags className="h-6 w-6" />} title="No categories" />
            ) : (
              <div className={isMobile ? "divide-y divide-border" : "grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3"}>
                {rows.map((r: any, idx: number) => (
                  <div key={idx} className={isMobile ? "mobile-record hover:bg-muted/50 transition-colors" : "entity-card p-4"}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
                          <Tags className="h-5 w-5" />
                        </div>
                        <div className="mt-3 truncate font-semibold text-foreground">
                          {r.name ?? r.title ?? r.categoryName ?? 'Unnamed Category'}
                        </div>
                      </div>
                      {actionButtons(r)}
                    </div>
                    <dl className={isMobile ? "mobile-meta" : "mt-4 space-y-2 text-sm"}>
                      {columns.filter(c => c.key !== 'name').map(col => {
                        const val = getValue(r, col)
                        return val ? (
                          <div key={col.key} className={isMobile ? "contents" : ""}>
                            <dt className={isMobile ? "" : "flex items-center gap-1 text-muted-foreground"}>{!isMobile && <FileText className="h-3.5 w-3.5" />}{col.label}</dt>
                            <dd className={isMobile ? "" : "text-foreground"}>{val}</dd>
                          </div>
                        ) : null
                      })}
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
          setEditingCategory(null)
          setShowCategoryForm(true)
        }}
        className="fixed z-40 w-14 h-14 bg-accent hover:brightness-105 text-accent-foreground rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-colors bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:hidden"
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
