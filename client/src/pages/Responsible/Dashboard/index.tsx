import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import {
  Users,
  Home,
  Calendar,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react";

export function ResponsibleDashboard() {
  // TODO: Fetch real metrics from API
  const metrics = {
    totalUsers: 0,
    totalHouses: 0,
    totalEvents: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    activeConventions: 0,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Tableau de Bord
                    </h1>
                  </div>
                  <p className="text-sm text-gray-500">
                    Vue d'ensemble des activités et statistiques
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Users Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalUsers}
              </h3>
              <p className="text-sm text-gray-500">Utilisateurs totaux</p>
              <div className="mt-2 text-xs text-blue-600">
                {metrics.pendingApprovals} en attente d'approbation
              </div>
            </Card>

            {/* Houses Card */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-50 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalHouses}
              </h3>
              <p className="text-sm text-gray-500">Propriétés</p>
            </Card>

            {/* Events Card */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-50 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalEvents}
              </h3>
              <p className="text-sm text-gray-500">Activités</p>
            </Card>

            {/* Bookings Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-50 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalBookings}
              </h3>
              <p className="text-sm text-gray-500">Réservations</p>
            </Card>

            {/* Conventions Card */}
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-50 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.activeConventions}
              </h3>
              <p className="text-sm text-gray-500">Conventions actives</p>
            </Card>
          </div>

          {/* Placeholder for future charts/tables */}
          <Card className="p-6 bg-white border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h2>
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Les graphiques et tableaux détaillés seront ajoutés prochainement</p>
            </div>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
