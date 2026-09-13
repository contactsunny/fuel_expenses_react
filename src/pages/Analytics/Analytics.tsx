import { NavLink } from 'react-router-dom'
import { ChartPie, Fuel, IndianRupee, Tags } from 'lucide-react'
import { Card } from '../../components/ui'

const views = [
  {
    to: '/live/analytics/vehicleCategory',
    title: 'Vehicle Category',
    description: 'Spend breakdown by vehicle category for the last 6 months.',
    icon: Tags,
  },
  {
    to: '/live/analytics/fuelPrice',
    title: 'Fuel Price',
    description: 'Unit price movement for petrol and diesel over time.',
    icon: IndianRupee,
  },
  {
    to: '/live/analytics/vsChart',
    title: 'Fuel Type',
    description: 'Compare total spend across fuel types.',
    icon: Fuel,
  },
]

export default function Analytics() {
  return (
    <div className="app-page space-y-5">
      <section className="app-hero p-5 md:p-7">
        <p className="app-eyebrow app-hero-muted">Insights</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Analytics</h1>
        <p className="mt-2 text-sm app-hero-muted">Explore spend insights across your fleet.</p>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {views.map(({ to, title, description, icon: Icon }) => (
          <NavLink key={to} to={to} className="group block focus-visible:outline-none">
            <Card className="h-full transition-colors group-hover:border-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-accent-muted text-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              <p className="mt-4 text-sm font-medium text-accent">Open view</p>
            </Card>
          </NavLink>
        ))}
      </div>

      <Card className="flex items-start gap-3 border-dashed">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-muted text-muted-foreground">
          <ChartPie className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Same data window as before</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Charts still cover the last six months. Presentation only — no new analytics filters.
          </p>
        </div>
      </Card>
    </div>
  )
}
