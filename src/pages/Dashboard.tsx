import { useEffect, useMemo, useState } from 'react'
import { getUserFuel, deleteFuel } from '../services/fuel'
import { getUserVehicles } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import { useFuelRecord } from '../contexts/FuelRecordContext'
import DateRangePicker from '../components/DateRangePicker'
import { toTitleCase } from '../utils/formatters'

export default function Dashboard() {
  const [allRows, setAllRows] = useState<any[]>([]) // All fetched rows
  const [rows, setRows] = useState<any[]>([]) // Filtered rows
  const [vehicles, setVehicles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; record: any | null }>({ show: false, record: null })
  const [deleting, setDeleting] = useState(false)

  // Filter states
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedFuelType, setSelectedFuelType] = useState<string>('')
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('')

  const { setEditingRecord, setShowFuelForm, refreshTrigger, triggerRefresh } = useFuelRecord()
  const [showFiltersModal, setShowFiltersModal] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }), [])
  const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }), [])
  const moneyInteger = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), [])

  // Initialize default date range (6 months ago to today)
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    
    setDateFrom(start.toISOString().split('T')[0])
    setDateTo(end.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Load vehicles and categories
  useEffect(() => {
    Promise.all([
      getUserVehicles(),
      getUserVehicleCategories(),
    ])
      .then(([vehiclesRes, catsRes]: any) => {
        const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data) as any
        const vehiclesList: any[] = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : []

        const catsPayload = (catsRes.data?.data ?? catsRes.data) as any
        const categoriesList: any[] = Array.isArray(catsPayload) ? catsPayload : Array.isArray(catsPayload?.items) ? catsPayload.items : []

        setVehicles(vehiclesList)
        setCategories(categoriesList)
      })
      .catch(() => console.error('Failed to load vehicles/categories'))
  }, [])

  // Fetch fuel data when date range changes
  useEffect(() => {
    if (!dateFrom || !dateTo) return

    const start = new Date(dateFrom)
    const end = new Date(dateTo)
    setLoading(true)

    getUserFuel(start, end)
      .then((fuelRes: any) => {
        const fuelPayload = (fuelRes.data?.data ?? fuelRes.data) as any
        const fuelItems: any[] = Array.isArray(fuelPayload) ? fuelPayload : Array.isArray(fuelPayload?.items) ? fuelPayload.items : []

        const vehicleIdToVehicle = new Map<string, any>()
        for (const v of vehicles) {
          const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
          if (!id) continue
          vehicleIdToVehicle.set(id, v)
        }

        const categoryIdToName = new Map<string, string>()
        for (const c of categories) {
          const id = String(c.id ?? c._id ?? c.categoryId ?? '')
          const name = String(c.name ?? c.title ?? c.categoryName ?? 'Unknown')
          if (!id) continue
          categoryIdToName.set(id, name)
        }

        const enriched = fuelItems.map((r: any) => {
          const vehicleId = String(r.vehicleId ?? r.vehicle?.id ?? r.vehicle?.vehicleId ?? '')
          const vehicle = vehicleId ? vehicleIdToVehicle.get(vehicleId) : undefined
          const vehicleName = r.vehicleName ?? r.vehicle?.name ?? vehicle?.name ?? vehicle?.vehicleName ?? ''

          const categoryId = String(
            r.vehicleCategoryId ?? r.categoryId ?? r.vehicle?.categoryId ?? vehicle?.categoryId ?? ''
          )
          const categoryName = categoryId ? (categoryIdToName.get(categoryId) ?? '') : ''

          return { ...r, vehicleName, vehicleCategoryName: categoryName, vehicleId: vehicleId || r.vehicleId, categoryId: categoryId || r.vehicleCategoryId }
        })

        setAllRows(enriched)
      })
      .catch(() => setError('Failed to load records'))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, refreshTrigger, vehicles, categories])

  // Apply filters to data
  useEffect(() => {
    let filtered = [...allRows]

    if (selectedVehicle) {
      filtered = filtered.filter(r => {
        const vehicleId = String(r.vehicleId ?? r.vehicle?.id ?? r.vehicle?.vehicleId ?? '')
        return vehicleId === selectedVehicle
      })
    }

    if (selectedCategory) {
      filtered = filtered.filter(r => {
        const categoryId = String(r.vehicleCategoryId ?? r.categoryId ?? r.vehicle?.categoryId ?? r.categoryId ?? '')
        return categoryId === selectedCategory
      })
    }

    if (selectedFuelType) {
      filtered = filtered.filter(r => {
        const fuelType = String(r.fuelType ?? r.type ?? '').toUpperCase()
        return fuelType === selectedFuelType.toUpperCase()
      })
    }

    if (selectedPaymentType) {
      filtered = filtered.filter(r => {
        const paymentType = String(r.paymentType ?? '').toUpperCase()
        return paymentType === selectedPaymentType.toUpperCase()
      })
    }

    setRows(filtered)
  }, [allRows, selectedVehicle, selectedCategory, selectedFuelType, selectedPaymentType])

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setShowFuelForm(true)
  }

  const handleDelete = (record: any) => {
    setDeleteConfirm({ show: true, record })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.record) return
    
    const recordId = deleteConfirm.record.id ?? deleteConfirm.record._id
    if (!recordId) {
      setDeleteConfirm({ show: false, record: null })
      return
    }

    setDeleting(true)
    try {
      await deleteFuel(String(recordId))
      triggerRefresh()
      setDeleteConfirm({ show: false, record: null })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  const handleResetFilters = () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 6)
    
    setDateFrom(start.toISOString().split('T')[0])
    setDateTo(end.toISOString().split('T')[0])
    setSelectedVehicle('')
    setSelectedCategory('')
    setSelectedFuelType('')
    setSelectedPaymentType('')
    setShowFiltersModal(false)
  }

  const isMobile = screenWidth < 768

  // Get unique fuel types and payment types from data
  const fuelTypes = useMemo(() => {
    const types = new Set<string>()
    allRows.forEach(r => {
      const fuelType = r.fuelType ?? r.type
      if (fuelType) types.add(String(fuelType).toUpperCase())
    })
    return Array.from(types).sort()
  }, [allRows])

  const paymentTypes = useMemo(() => {
    const types = new Set<string>()
    allRows.forEach(r => {
      const paymentType = r.paymentType
      if (paymentType) types.add(String(paymentType).toUpperCase())
    })
    return Array.from(types).sort()
  }, [allRows])

  // Calculate total amount for filtered rows
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => {
      const amount = r.amount ?? r.price ?? r.cost ?? 0
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0)
    }, 0)
  }, [rows])

  // Calculate total litres for filtered rows
  const totalLitres = useMemo(() => {
    return rows.reduce((sum, r) => {
      const litres = r.litres ?? r.liters ?? r.volume ?? r.quantity ?? 0
      return sum + (typeof litres === 'number' ? litres : parseFloat(litres) || 0)
    }, 0)
  }, [rows])

  // Pagination calculations
  const totalPages = Math.ceil(rows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRows = rows.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [rows.length, itemsPerPage])

  // Format date range for display
  const formatDateRange = (start: string, end: string): string => {
    if (!start || !end) return ''
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    const startDay = startDate.getDate()
    const startMonth = startDate.toLocaleDateString('en-GB', { month: 'short' })
    const startYear = startDate.getFullYear()
    const endDay = endDate.getDate()
    const endMonth = endDate.toLocaleDateString('en-GB', { month: 'short' })
    const endYear = endDate.getFullYear()
    
    if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
      return `${startDay} ${startMonth} ${startYear}`
    } else if (startYear === endYear && startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth} ${startYear}`
    } else if (startYear === endYear) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`
    } else {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 md:gap-3 flex-nowrap overflow-hidden">
        <div className="flex items-center gap-2 md:gap-3 flex-nowrap min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold dark:text-slate-100 whitespace-nowrap flex-shrink-0">Records</h2>
          
          {/* Date Range Box */}
          <div className="px-2 py-1 md:px-4 md:py-2 bg-blue-600 dark:bg-blue-700 rounded-lg flex-shrink-0">
            <span className="text-xs md:text-sm font-medium text-blue-100 dark:text-blue-50 whitespace-nowrap">
              {formatDateRange(dateFrom, dateTo)}
            </span>
          </div>
          
          {/* Total Amount Box */}
          <div className="px-2 py-1 md:px-4 md:py-2 bg-blue-600 dark:bg-blue-700 rounded-lg flex-shrink-0">
            <span className="text-xs md:text-sm font-medium text-blue-100 dark:text-blue-50 whitespace-nowrap">
              {moneyInteger.format(Math.round(totalAmount))}
            </span>
          </div>
          
          {/* Total Litres Box */}
          <div className="px-2 py-1 md:px-4 md:py-2 bg-blue-600 dark:bg-blue-700 rounded-lg flex-shrink-0">
            <span className="text-xs md:text-sm font-medium text-blue-100 dark:text-blue-50 whitespace-nowrap">
              {Math.round(totalLitres)} L
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowFiltersModal(true)}
          className="px-2 py-2 md:px-4 md:py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden md:inline">Filters</span>
        </button>
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowFiltersModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label>
                  <DateRangePicker
                    startDate={dateFrom}
                    endDate={dateTo}
                    onChange={(start, end) => {
                      setDateFrom(start)
                      setDateTo(end)
                    }}
                  />
                </div>

                {/* Vehicle Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Vehicles</option>
                    {vehicles.map((v) => {
                      const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
                      const name = v.name ?? v.vehicleName ?? 'Unknown'
                      return <option key={id} value={id}>{name}</option>
                    })}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => {
                      const id = String(c.id ?? c._id ?? c.categoryId ?? '')
                      const name = c.name ?? c.title ?? c.categoryName ?? 'Unknown'
                      return <option key={id} value={id}>{name}</option>
                    })}
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fuel Type</label>
                  <select
                    value={selectedFuelType}
                    onChange={(e) => setSelectedFuelType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Fuel Types</option>
                    {fuelTypes.map((type) => (
                      <option key={type} value={type}>{toTitleCase(type)}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Type Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                  <select
                    value={selectedPaymentType}
                    onChange={(e) => setSelectedPaymentType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Payment Methods</option>
                    {paymentTypes.map((type) => (
                      <option key={type} value={type}>{toTitleCase(type)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0 overflow-hidden shadow-sm">
        {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            {isMobile ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {paginatedRows.length === 0 ? (
                  <div className="py-6 text-slate-500 dark:text-slate-400 text-center">No records</div>
                ) : (
                  paginatedRows.map((r: any, idx: number) => {
                    const dateVal = r.date ?? r.createdAt ?? ''
                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                    return (
                      <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{isNaN(date.getTime()) ? '' : fmt.format(date)}</div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{toTitleCase(r.fuelType ?? r.type ?? '')}</span>
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              aria-label="Edit record"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              aria-label="Delete record"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <div><span className="font-medium">Vehicle:</span> {r.vehicleName ?? r.vehicle ?? ''}</div>
                          <div><span className="font-medium">Category:</span> {r.vehicleCategoryName ?? ''}</div>
                          <div><span className="font-medium">Volume:</span> {r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''} L</div>
                          <div><span className="font-medium">Price:</span> {typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left text-slate-600 dark:text-slate-300">
                    <th className="py-3 pl-4 pr-4">Date</th>
                    <th className="py-3 pr-4">Vehicle</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Fuel Type</th>
                    <th className="py-3 pr-4">Volume (L)</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedRows.map((r: any, idx: number) => {
                    const dateVal = r.date ?? r.createdAt ?? ''
                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 pl-4 pr-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{isNaN(date.getTime()) ? '' : fmt.format(date)}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.vehicleName ?? r.vehicle ?? ''}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.vehicleCategoryName ?? ''}</td>
                        <td className="py-3 pr-4"><span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{toTitleCase(r.fuelType ?? r.type ?? '')}</span></td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''}</td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              aria-label="Edit record"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              aria-label="Delete record"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={7}>No records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {rows.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between flex-wrap gap-4">
                {/* Left Section - Items Per Page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1em 1em',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-sm text-slate-700 dark:text-slate-300">of {rows.length} records</span>
                </div>

                {/* Right Section - Page Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1em 1em',
                      paddingRight: '2rem'
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-700 dark:text-slate-300">of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirm({ show: false, record: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold dark:text-slate-100 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this fuel record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, record: null })}
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
