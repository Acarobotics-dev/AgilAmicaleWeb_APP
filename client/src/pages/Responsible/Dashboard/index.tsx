import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Home,
  Calendar,
  FileText,
  Activity,
  Briefcase
} from "lucide-react"

export function ResponsibleDashboard() {
  // TODO: Fetch real metrics from API
  const metrics = {
    totalUsers: 0,
    totalHouses: 0,
    totalEvents: 0,
    totalBookings: 0,
    activeConventions: 0,
  }

  const statCards = [
    { label: "Utilisateurs", value: metrics.totalUsers, icon: Users, desc: "Inscrits sur la plateforme" },
    { label: "Propriétés", value: metrics.totalHouses, icon: Home, desc: "Disponibles à la location" },
    { label: "Activités", value: metrics.totalEvents, icon: Calendar, desc: "Événements publiés" },
    { label: "Réservations", value: metrics.totalBookings, icon: FileText, desc: "Total des réservations" },
    { label: "Conventions", value: metrics.activeConventions, icon: Briefcase, desc: "Partenariats actifs" },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 min-w-0 bg-white">
          <div className="h-full flex flex-col">
            {/* Header */}
            <header className="flex items-center h-16 px-6 border-b shrink-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-lg font-medium">Tableau de bord</h1>
              </div>
            </header>

            <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                  <Card key={i} className="shadow-none border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Activity Section Placeholder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-gray-900">Activité récente</h2>
                </div>
                <Card className="shadow-none border-gray-200 min-h-[300px] flex items-center justify-center text-sm text-gray-500">
                  Aucune activité récente à afficher
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
