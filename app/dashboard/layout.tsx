import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-dark">
      <Sidebar accountName="My Store" userName="Nick" userPlan="Free" />
      <main className="ml-60 p-8">
        {children}
      </main>
    </div>
  )
}
