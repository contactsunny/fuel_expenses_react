import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface FuelRecordContextType {
  editingRecord: any | null
  setEditingRecord: (record: any | null) => void
  showFuelForm: boolean
  setShowFuelForm: (show: boolean) => void
  refreshTrigger: number
  triggerRefresh: () => void
}

const FuelRecordContext = createContext<FuelRecordContextType | undefined>(undefined)

export function FuelRecordProvider({ children }: { children: ReactNode }) {
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <FuelRecordContext.Provider
      value={{
        editingRecord,
        setEditingRecord,
        showFuelForm,
        setShowFuelForm,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </FuelRecordContext.Provider>
  )
}

export function useFuelRecord() {
  const context = useContext(FuelRecordContext)
  if (context === undefined) {
    throw new Error('useFuelRecord must be used within a FuelRecordProvider')
  }
  return context
}

