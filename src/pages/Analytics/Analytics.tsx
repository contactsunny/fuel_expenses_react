import { ChartPie } from 'lucide-react'
import { PageHeader, Card, EmptyState } from '../../components/ui'

export default function Analytics() {
  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" description="Explore spend insights across your fleet." />
      <Card padding={false}>
        <EmptyState
          icon={<ChartPie className="h-5 w-5" />}
          title="Choose a view"
          description="Pick an analytics view from the sidebar to get started."
        />
      </Card>
    </div>
  )
}
