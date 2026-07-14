import { useState, useEffect, useRef } from 'react'

interface DateRangePickerProps {
  startDate: string // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format
  onChange: (start: string, end: string) => void
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (startDate) {
      const date = new Date(startDate)
      return new Date(date.getFullYear(), date.getMonth(), 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempStart(startDate)
    setTempEnd(endDate)
    if (startDate) {
      setCurrentMonth(new Date(startDate))
    }
  }, [startDate, endDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    if (selectingStart) {
      setTempStart(dateStr)
      setTempEnd(dateStr)
      setSelectingStart(false)
    } else {
      if (new Date(dateStr) < new Date(tempStart)) {
        // If clicked date is before start, make it the new start
        setTempStart(dateStr)
        setTempEnd(tempStart)
      } else {
        setTempEnd(dateStr)
        setSelectingStart(true)
        onChange(tempStart, dateStr)
        setIsOpen(false)
      }
    }
  }

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onChange(tempStart, tempEnd)
      setIsOpen(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const selectMonth = (month: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), month, 1))
    setShowMonthPicker(false)
  }

  const selectYear = (year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1))
    setShowYearPicker(false)
  }

  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getYearRange = () => {
    const currentYear = currentMonth.getFullYear()
    const startYear = currentYear - 10
    const endYear = currentYear + 10
    const years: number[] = []
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  const isInRange = (date: Date): boolean => {
    if (!tempStart || !tempEnd) return false
    const dateStr = date.toISOString().split('T')[0]
    return dateStr >= tempStart && dateStr <= tempEnd
  }

  const isStartDate = (date: Date): boolean => {
    if (!tempStart) return false
    return date.toISOString().split('T')[0] === tempStart
  }

  const isEndDate = (date: Date): boolean => {
    if (!tempEnd) return false
    return date.toISOString().split('T')[0] === tempEnd
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const days = generateCalendar()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[currentMonth.getMonth()]
  const year = currentMonth.getFullYear()
  const years = getYearRange()

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left flex items-center justify-between hover:border-muted-foreground/40 transition-colors"
      >
        <span>
          {tempStart && tempEnd ? `${formatDate(tempStart)} - ${formatDate(tempEnd)}` : 'Select date range'}
        </span>
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-surface-elevated border border-border rounded-xl shadow-xl shadow-black/20 p-4 w-80 animate-scale-in">
          <div className="mb-4">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowYearPicker(false)
                    setShowMonthPicker(!showMonthPicker)
                  }}
                  className="px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {monthName}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMonthPicker(false)
                    setShowYearPicker(!showYearPicker)
                  }}
                  className="px-3 py-1 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {year}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Month Picker */}
            {showMonthPicker && (
              <div className="mb-3 p-2 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-2">
                  {monthNames.map((month, idx) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => selectMonth(idx)}
                      className={`px-3 py-2 text-xs rounded transition-colors ${
                        idx === currentMonth.getMonth()
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'hover:bg-border/60 text-muted-foreground'
                      }`}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Picker */}
            {showYearPicker && (
              <div className="mb-3 p-2 bg-muted rounded-lg max-h-48 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => selectYear(y)}
                      className={`px-3 py-2 text-xs rounded transition-colors ${
                        y === currentMonth.getFullYear()
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'hover:bg-border/60 text-muted-foreground'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground text-center py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-8" />
                }

                const inRange = isInRange(date)
                const isStart = isStartDate(date)
                const isEnd = isEndDate(date)
                const today = isToday(date)

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`
                      h-8 text-xs rounded transition-colors
                      ${isStart || isEnd
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : inRange
                        ? 'bg-accent-muted text-accent'
                        : 'hover:bg-muted text-foreground'
                      }
                      ${today && !isStart && !isEnd ? 'ring-1 ring-border' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-3 py-2 text-sm bg-accent hover:brightness-110 text-accent-foreground rounded-lg transition-colors font-medium"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

