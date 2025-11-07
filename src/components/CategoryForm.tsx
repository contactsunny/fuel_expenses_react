import { useState, useEffect } from 'react'
import { createVehicleCategory, updateVehicleCategory } from '../services/vehicleCategories'

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  category?: any // For edit mode
}

export default function CategoryForm({ isOpen, onClose, onSave, category }: CategoryFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      // If editing, populate form with category data
      if (category) {
        setFormData({
          name: category.name ?? category.title ?? category.categoryName ?? '',
          description: category.description ?? ''
        })
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          description: ''
        })
      }
    }
  }, [isOpen, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name || formData.name.trim() === '') {
        setError('Please enter a category name')
        setSaving(false)
        return
      }

      const payload: any = {
        name: String(formData.name).trim()
      }

      if (formData.description && formData.description.trim() !== '') {
        payload.description = String(formData.description).trim()
      }

      const categoryId = category?.id ?? category?._id
      if (categoryId) {
        // Update mode
        await updateVehicleCategory(String(categoryId), payload)
      } else {
        // Create mode
        await createVehicleCategory(payload)
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('Error saving category:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save category'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold dark:text-slate-100 mb-4">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
                required
                autoComplete="off"
                data-lpignore="true"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
                rows={3}
                autoComplete="off"
                data-lpignore="true"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

