import { Wrench } from 'lucide-react'
import { PageHeader, Card, EmptyState } from '../components/ui'

export default function ServiceRecords() {
  return (
    <div className="space-y-4">
      <PageHeader title="Service Records" description="Maintenance and service history for your vehicles." />
      <Card padding={false}>
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Coming soon"
          description="Service records table will appear here."
        />
      </Card>
    </div>
  )
}
