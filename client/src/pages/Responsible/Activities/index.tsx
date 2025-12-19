import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventTableRow } from "./ActivitiesTableRow";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { getAllEvents } from "@/services";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Event } from "./ActivityForm/types";
import {
  CalendarPlus,
  Search,
  Text,
  List,
  MapPin,
  CalendarOff,
  Info,
  PartyPopper,
  Calendar,
  DollarSign,
  Users,
  X,
  ChevronDown,
  Filter,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 10;
const ALLOWED_CATEGORIES = ["Voyage", "Excursion", "Club", "Évènement", "Activité"];

// Loading skeleton component
function ActivitiesListSkeleton() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
          {/* Header Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search/Filter Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}

export function EventSection() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const {
    data: { data: events = [] } = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  // Memoize filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let result = [...events];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((event: Event) =>
        event.title.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      result = result.filter((event: Event) => event.type === categoryFilter);
    }

    return result;
  }, [events, searchQuery, categoryFilter]);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    return [...new Set(
      events
        .map((event: Event) => event.type)
        .filter((type: string) => ALLOWED_CATEGORIES.includes(type))
    )];
  }, [events]);

  const handleActionComplete = useCallback(() => refetch(), [refetch]);
  const handleAddEvent = useCallback(() => navigate("/responsable/events/add"), [navigate]);

  const totalPages = Math.ceil((filteredEvents.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleCategoryFilter = useCallback((value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("");
    setCurrentPage(1);
  }, []);

  if (isLoading) {
    return <ActivitiesListSkeleton />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                <Info className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-6">
                Une erreur s'est produite lors du chargement des événements. Veuillez réessayer.
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-full"
              >
                Réessayer
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">

          {/* Header Section */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="mt-1" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <PartyPopper className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Événements
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{events.length} événements totales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{filteredEvents.length} événements visibles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Gérez toutes vos activités</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full"
                  onClick={handleAddEvent}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Ajouter un Événement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Événements</p>
                    <p className="text-3xl font-bold text-blue-900">{events.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Événements Filtrés</p>
                    <p className="text-3xl font-bold text-green-900">{filteredEvents.length}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Catégories</p>
                    <p className="text-3xl font-bold text-purple-900">{uniqueCategories.length}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <List className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Places Totales</p>
                    <p className="text-3xl font-bold text-amber-900">
                      {events.reduce((total: number, event: Event) => {
                        const available = (event.maxParticipants || 0) - (event.currentParticipants || 0);
                        return total + available;
                      }, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card className="bg-blue-500/5 mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par titre d'événement..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Catégorie
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          <span>{categoryFilter || "Toutes les catégories"}</span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[240px] p-2 max-h-60 overflow-y-auto">
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() => handleCategoryFilter("")}
                        >
                          {!categoryFilter && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Toutes les catégories</span>
                        </DropdownMenuItem>
                        {uniqueCategories.map((category) => (
                          <DropdownMenuItem
                            key={String(category)}
                            className="flex items-center gap-2 py-2 cursor-pointer"
                            onClick={() => handleCategoryFilter(String(category))}
                          >
                            {categoryFilter === category && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="truncate">{String(category)}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={resetFilters}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-blue-600" />
                Liste des événements
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredEvents.length} résultats
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Text className="w-4 h-4 text-blue-500" />
                        <span>Titre</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <List className="w-4 h-4 text-blue-500" />
                        <span>Catégorie</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>Destination</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span>Prix</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEvents.length > 0 ? (
                    currentEvents.map((event) => (
                      <EventTableRow
                        key={event._id}
                        event={event}
                        onActionComplete={handleActionComplete}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <CalendarOff className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucun événement trouvé
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {filteredEvents.length === 0 && events.length > 0
                                ? "Aucun événement ne correspond à vos critères"
                                : "Aucun événement n'a été ajouté pour le moment"}
                            </p>
                          </div>
                          {events.length === 0 && (
                            <Button
                              onClick={handleAddEvent}
                              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                            >
                              <CalendarPlus className="w-4 h-4 mr-2" />
                              Ajouter un événement
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden p-4 space-y-4">
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          <Text className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">{event.title}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <List className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>{event.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                  <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarOff className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Aucun événement trouvé
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {filteredEvents.length === 0 && events.length > 0
                      ? "Aucun événement ne correspond à vos critères"
                      : "Aucun événement n'a été ajouté pour le moment"}
                  </p>
                  {events.length === 0 && (
                    <Button
                      onClick={handleAddEvent}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Ajouter un événement
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="p-3">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}