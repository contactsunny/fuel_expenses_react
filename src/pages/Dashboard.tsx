import { useEffect, useMemo, useState } from 'react'
import { Filter, Pencil, Trash2, ChevronLeft, ChevronRight, ClipboardList, CalendarDays, IndianRupee, Fuel } from 'lucide-react'
import { getUserFuel, deleteFuel } from '../services/fuel'
import { getUserVehicles } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import { useFuelRecord } from '../contexts/FuelRecordContext'
import DateRangePicker from '../components/DateRangePicker'
import { toTitleCase } from '../utils/formatters'
import {
  Button,
  Select,
  Label,
  Card,
  Dialog,
  DialogFooter,
  Badge,
  PageLoading,
  EmptyState,
  Alert,
} from '../components/ui'

export default function Dashboard() {
  const [allRows, setAllRows] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; record: any | null }>({ show: false, record: null })
  const [deleting, setDeleting] = useState(false)

  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedFuelType, setSelectedFuelType] = useState<string>('')
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('')

  const { setEditingRecord, setShowFuelForm, refreshTrigger, triggerRefresh } = useFuelRecord()
  const [showFiltersModal, setShowFiltersModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }), [])
  const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }), [])
  const moneyInteger = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), [])

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

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => {
      const amount = r.amount ?? r.price ?? r.cost ?? 0
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0)
    }, 0)
  }, [rows])

  const totalLitres = useMemo(() => {
    return rows.reduce((sum, r) => {
      const litres = r.litres ?? r.liters ?? r.volume ?? r.quantity ?? 0
      return sum + (typeof litres === 'number' ? litres : parseFloat(litres) || 0)
    }, 0)
  }, [rows])

  const totalPages = Math.ceil(rows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRows = rows.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [rows.length, itemsPerPage])

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
    <div className="app-page space-y-5">
      <section className="app-hero overflow-hidden p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase app-hero-muted">Fuel log</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Records</h1>
            <p className="mt-2 max-w-2xl text-sm app-hero-muted">
              {rows.length} records in view for {formatDateRange(dateFrom, dateTo)}
            </p>
          </div>
          <Button variant="secondary" size="md" onClick={() => setShowFiltersModal(true)} className="bg-white/10 text-white hover:bg-white/15 md:w-auto">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card p-4">
          <div className="flex items-center gap-2 text-accent"><CalendarDays className="h-4 w-4" /><span className="metric-label">Range</span></div>
          <div className="metric-value mt-2">{formatDateRange(dateFrom, dateTo)}</div>
        </div>
        <div className="metric-card p-4">
          <div className="flex items-center gap-2 text-accent"><IndianRupee className="h-4 w-4" /><span className="metric-label">Spend</span></div>
          <div className="metric-value mt-2">{moneyInteger.format(Math.round(totalAmount))}</div>
        </div>
        <div className="metric-card p-4">
          <div className="flex items-center gap-2 text-accent"><Fuel className="h-4 w-4" /><span className="metric-label">Volume</span></div>
          <div className="metric-value mt-2">{Math.round(totalLitres)} L</div>
        </div>
      </div>

      <Dialog open={showFiltersModal} onClose={() => setShowFiltersModal(false)} title="Filters" size="lg">
        <div className="space-y-4">
          <div>
            <Label>Date Range</Label>
            <DateRangePicker
              startDate={dateFrom}
              endDate={dateTo}
              onChange={(start, end) => {
                setDateFrom(start)
                setDateTo(end)
              }}
            />
          </div>

          <div>
            <Label htmlFor="filter-vehicle">Vehicle</Label>
            <Select id="filter-vehicle" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
              <option value="">All Vehicles</option>
              {vehicles.map((v) => {
                const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
                const name = v.name ?? v.vehicleName ?? 'Unknown'
                return <option key={id} value={id}>{name}</option>
              })}
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-category">Category</Label>
            <Select id="filter-category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => {
                const id = String(c.id ?? c._id ?? c.categoryId ?? '')
                const name = c.name ?? c.title ?? c.categoryName ?? 'Unknown'
                return <option key={id} value={id}>{name}</option>
              })}
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-fuel">Fuel Type</Label>
            <Select id="filter-fuel" value={selectedFuelType} onChange={(e) => setSelectedFuelType(e.target.value)}>
              <option value="">All Fuel Types</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>{toTitleCase(type)}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-payment">Payment Method</Label>
            <Select id="filter-payment" value={selectedPaymentType} onChange={(e) => setSelectedPaymentType(e.target.value)}>
              <option value="">All Payment Methods</option>
              {paymentTypes.map((type) => (
                <option key={type} value={type}>{toTitleCase(type)}</option>
              ))}
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="flex-1" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button type="button" className="flex-1" onClick={() => setShowFiltersModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      <Card padding={false} className="section-panel">
        {loading && <PageLoading label="Loading…" />}
        {error && !loading && (
          <div className="p-6">
            <Alert>{error}</Alert>
          </div>
        )}
        {!loading && !error && (
          <>
            {isMobile ? (
              <div className="divide-y divide-border">
                {paginatedRows.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardList className="h-5 w-5" />}
                    title="No records"
                    description="Try adjusting filters or add a fuel record."
                  />
                ) : (
                  paginatedRows.map((r: any, idx: number) => {
                    const dateVal = r.date ?? r.createdAt ?? ''
                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                    return (
                      <div key={idx} className="mobile-record hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-medium text-foreground text-sm">
                            {isNaN(date.getTime()) ? '' : fmt.format(date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge>{toTitleCase(r.fuelType ?? r.type ?? '')}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => handleEdit(r)} aria-label="Edit record">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(r)} aria-label="Delete record">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <dl className="mobile-meta">
                          <dt>Vehicle</dt><dd>{r.vehicleName ?? r.vehicle ?? ''}</dd>
                          <dt>Category</dt><dd>{r.vehicleCategoryName ?? ''}</dd>
                          <dt>Volume</dt><dd>{r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''} L</dd>
                          <dt>Price</dt><dd>{typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</dd>
                        </dl>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="app-table">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-3 pl-4 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Vehicle</th>
                      <th className="py-3 pr-4 font-medium">Category</th>
                      <th className="py-3 pr-4 font-medium">Fuel Type</th>
                      <th className="py-3 pr-4 font-medium">Volume (L)</th>
                      <th className="py-3 pr-4 font-medium">Price</th>
                      <th className="py-3 pr-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((r: any, idx: number) => {
                      const dateVal = r.date ?? r.createdAt ?? ''
                      const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal)
                      return (
                        <tr key={idx}>
                          <td className="py-3 pl-4 pr-4 whitespace-nowrap text-foreground">{isNaN(date.getTime()) ? '' : fmt.format(date)}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.vehicleName ?? r.vehicle ?? ''}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.vehicleCategoryName ?? ''}</td>
                          <td className="py-3 pr-4"><Badge>{toTitleCase(r.fuelType ?? r.type ?? '')}</Badge></td>
                          <td className="py-3 pr-4 text-muted-foreground">{r.litres ?? r.liters ?? r.volume ?? r.quantity ?? ''}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '')}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => handleEdit(r)} aria-label="Edit record">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(r)} aria-label="Delete record">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            icon={<ClipboardList className="h-5 w-5" />}
                            title="No records"
                            description="Try adjusting filters or add a fuel record."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {rows.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-surface flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="w-auto min-w-[4.5rem]"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                  <span className="text-sm text-muted-foreground">of {rows.length} records</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page</span>
                  <Select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="w-auto min-w-[4rem]"
                  >
                    {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </Select>
                  <span className="text-sm text-muted-foreground">of {totalPages || 1}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Dialog open={deleteConfirm.show} onClose={() => setDeleteConfirm({ show: false, record: null })} title="Confirm Delete" size="sm">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this fuel record? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteConfirm({ show: false, record: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" className="flex-1" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
