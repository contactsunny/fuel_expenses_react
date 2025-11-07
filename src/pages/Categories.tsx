import { useEffect, useMemo, useState } from 'react'
import { getUserVehicleCategories, deleteVehicleCategory } from '../services/vehicleCategories'
import CategoryForm from '../components/CategoryForm'

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
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {r.name ?? r.title ?? r.categoryName ?? 'Unnamed Category'}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            aria-label="Edit category"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete category"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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
                      <th className="py-3 pr-4">Actions</th>
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
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              aria-label="Edit category"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              aria-label="Delete category"
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
                        <td className="py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={columns.length + 1}>No categories</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No categories</div>
              )
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setEditingCategory(null)
          setShowCategoryForm(true)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-colors"
        aria-label="Add category"
      >
        +
      </button>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false)
          setEditingCategory(null)
        }}
        onSave={handleFormSave}
        category={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirm({ show: false, category: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold dark:text-slate-100 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, category: null })}
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
