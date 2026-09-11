import { ChartPie } from 'lucide-react'
import { Card, EmptyState } from '../../components/ui'

export default function Analytics() {
  return (
    <div className="app-page space-y-5">
      <section className="app-hero p-5 md:p-7">
        <p className="text-xs font-semibold uppercase app-hero-muted">Insights</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Analytics</h1>
        <p className="mt-2 text-sm app-hero-muted">Explore spend insights across your fleet.</p>
      </section>
      <Card padding={false} className="section-panel">
        <EmptyState
          icon={<ChartPie className="h-5 w-5" />}
          title="Choose a view"
          description="Pick an analytics view from the sidebar to get started."
        />
      </Card>
    </div>
  )
}
