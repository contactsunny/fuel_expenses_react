import { useState, useEffect } from 'react'
import { createVehicleCategory, updateVehicleCategory } from '../services/vehicleCategories'
import { Button, Input, Textarea, Label, Alert, Dialog, DialogFooter } from './ui'

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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add Category'}
      size="sm"
    >
      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="category-name">Category Name *</Label>
          <Input
            id="category-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
            autoComplete="off"
            data-lpignore="true"
          />
        </div>

        <div>
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            autoComplete="off"
            data-lpignore="true"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
