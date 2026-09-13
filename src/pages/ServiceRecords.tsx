import { Wrench } from 'lucide-react'
import { Card, EmptyState } from '../components/ui'

export default function ServiceRecords() {
  return (
    <div className="app-page space-y-5">
      <section className="app-hero p-5 md:p-7">
        <p className="app-eyebrow app-hero-muted">Maintenance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Service Records</h1>
        <p className="mt-2 text-sm app-hero-muted">Maintenance and service history for your vehicles.</p>
      </section>
      <Card padding={false} className="section-panel">
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Coming soon"
          description="Service history will appear here in a future update. This screen is not editable yet."
        />
      </Card>
    </div>
  )
}
