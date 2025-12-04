import { useState, useEffect } from "react";
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
import { BookingTableRow } from "./bookingTableRow";
import { PaginationComponent } from "@/components/common/paginationComponent";
import {
  getAllBookings,
  getAllUsersService,
  getAllHousesService,
  getAllEvents,
} from "@/services";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-datepicker/dist/react-datepicker.css";
import { User, House, Event, Booking } from "./types";
import { Album, BookX, Book, Search, Filter, X, CheckCircle, Clock, XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Loading skeleton component
function BookingsListSkeleton() {
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
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

export function BookingsSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [activitiesMap, setActivitiesMap] = useState<Record<string, House | Event>>({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderingFilter, setOrderingFilter] = useState("none"); // 'none', 'periodAsc', 'periodDesc'

  /**
   * PERFORMANCE OPTIMIZATION NOTE:
   *
   * Current implementation fetches four full datasets (bookings, users, houses, events)
   * and performs client-side joins and filtering. This approach has limitations:
   *
   * RECOMMENDED IMPROVEMENTS (requires backend changes):
   * 1. Implement server-side pagination on getAllBookings endpoint
   *    - Add parameters: page, pageSize, category, status, searchTerm
   *    - Return paginated results with total count
   *
   * 2. Embed minimal related data in booking records
   *    - Include user: { _id, firstName, lastName, userEmail }
   *    - Include activity: { _id, title, type }
   *    - This eliminates need for separate users/houses/events queries
   *
   * 3. If full list queries must remain, add caching configuration:
   *    staleTime: 5 * 60 * 1000 (5 minutes)
   *    cacheTime: 10 * 60 * 1000 (10 minutes)
   *    This reduces refetching when navigating within Responsible area
   *
   * TRADE-OFF: Current approach allows rich client-side filtering but doesn't
   * scale well beyond ~1000 bookings. Monitor performance and prioritize backend
   * pagination when dataset grows.
   */

  // Fetch all necessary data
  const {
    data: bookingsData = { data: [] },
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery<{ data: Booking[] }>({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduce unnecessary refetches
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (was cacheTime in v4)
  });

  const {
    data: usersData = { data: [] },
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsersService,
    enabled: !!bookingsData.data.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: housesData = { data: [] },
    isLoading: isLoadingHouses,
    error: housesError,
  } = useQuery({
    queryKey: ["houses"],
    queryFn: getAllHousesService,
    enabled: !!bookingsData.data.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: eventsData = { data: [] },
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
    enabled: !!bookingsData.data.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create lookup maps when data is loaded
  useEffect(() => {
    if (usersData.data.length) {
      const usersMap = usersData.data.reduce((acc: Record<string, User>, user: User) => {
        acc[user._id] = user;
        return acc;
      }, {});
      setUsersMap(usersMap);
    }
  }, [usersData]);

  useEffect(() => {
    if (housesData.data.length || eventsData.data.length) {
      const activitiesMap: Record<string, House | Event> = {};
      housesData.data.forEach((house: House) => {
        activitiesMap[house._id] = {
          ...house,
          activityType: "House",
        };
      });
      eventsData.data.forEach((event: Event) => {
        activitiesMap[event._id] = {
          ...event,
          activityType: "Event",
        };
      });
      setActivitiesMap(activitiesMap);
    }
  }, [housesData, eventsData]);

  const handleActionComplete = () => {
    refetchBookings();
  };

  // Apply filters to bookings
  let filteredBookings = bookingsData.data?.filter((booking: Booking) => {
    // Apply search term filter
    if (searchTerm) {
      const user = usersMap[booking.userId];
      const userMatch =
        user &&
        (user.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const activity = activitiesMap[booking.activity];
      const activityMatch =
        activity &&
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!userMatch && !activityMatch) return false;
    }

    // Apply category filter
    if (
      categoryFilter &&
      categoryFilter !== "all" &&
      booking.activityCategory !== categoryFilter
    ) {
      return false;
    }

    // Apply status filter
    if (
      statusFilter &&
      statusFilter !== "all" &&
      booking.status !== statusFilter
    ) {
      return false;
    }

    return true;
  }) || [];

  // If ordering by booking period requested, compute comparable start date and sort
  if (filteredBookings && orderingFilter && orderingFilter !== 'none') {
    const getComparableStart = (b: Booking) => {
      // prefer bookingPeriod.start, fall back to startDate or start
      const d = b.bookingPeriod?.start ?? null;
      return d ? new Date(d).getTime() : 0;
    };

    filteredBookings = filteredBookings.slice().sort((a: Booking, b: Booking) => {
      const sa = getComparableStart(a);
      const sb = getComparableStart(b);
      if (sa === sb) return 0;
      return orderingFilter === "periodAsc" ? sa - sb : sb - sa;
    });
  }

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, orderingFilter]);

  // Calculate stats
  const bookings = bookingsData.data || [];
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b: Booking) => b.status === "confirmé").length,
    pending: bookings.filter((b: Booking) => b.status === "en attente").length,
    cancelled: bookings.filter((b: Booking) => b.status === "annulé").length,
  };

  const isLoading =
    isLoadingBookings || isLoadingUsers || isLoadingHouses || isLoadingEvents;

  const error = bookingsError || usersError || housesError || eventsError;

  if (isLoading) {
    return <BookingsListSkeleton />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
                <BookX className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-6">
                Une erreur s'est produite lors du chargement des réservations. Veuillez réessayer.
              </p>
              <Button
                onClick={() => refetchBookings()}
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
                        <Book className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Réservations
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{bookingsData.data.length} réservations totales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{filteredBookings.length} réservations filtrées</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Gérez toutes vos réservations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Total Bookings */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Total Réservations
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmed Bookings */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Confirmées
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.confirmed}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Bookings */}
            <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">
                      En Attente
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancelled Bookings */}
            <Card className="overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Annulées
                    </p>
                    <p className="text-3xl font-bold text-red-900">
                      {stats.cancelled}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500 rounded-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-6 bg-blue-500/5">
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
                      placeholder="Rechercher par matricule, nom ou activité..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Catégorie
                    </label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <SelectValue placeholder="Toutes catégories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        <SelectItem value="Sejour Maison">Séjour Maison</SelectItem>
                        <SelectItem value="Voyage">Voyage</SelectItem>
                        <SelectItem value="Excursion">Excursion</SelectItem>
                        <SelectItem value="Club">Club</SelectItem>
                        <SelectItem value="Évènement">Évènement</SelectItem>
                        <SelectItem value="Activité">Activité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Statut
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <SelectValue placeholder="Tous statuts" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="en attente">En attente</SelectItem>
                        <SelectItem value="confirmé">Confirmé</SelectItem>
                        <SelectItem value="annulé">Annulé</SelectItem>
                        <SelectItem value="terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Trier par période
                    </label>
                    <Select value={orderingFilter} onValueChange={setOrderingFilter}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <SelectValue placeholder="Aucun" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        <SelectItem value="periodAsc">Période croissante</SelectItem>
                        <SelectItem value="periodDesc">Période décroissante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Reset Filters */}
                {(searchTerm || categoryFilter || statusFilter || orderingFilter !== 'none') && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("");
                        setStatusFilter("");
                        setOrderingFilter("none");
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <Book className="w-4 h-4 text-blue-600" />
                Liste des réservations
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredBookings.length} résultats
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activité
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période/Date
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.length > 0 ? (
                    currentBookings.map((booking: Booking) => (
                      <BookingTableRow
                        key={booking._id}
                        booking={booking}
                        usersMap={usersMap}
                        activitiesMap={activitiesMap}
                        onActionComplete={handleActionComplete}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <BookX className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucune réservation trouvée
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {filteredBookings.length === 0 && bookingsData.data.length > 0
                                ? "Aucune réservation ne correspond à vos critères"
                                : "Aucune réservation n'a été effectuée pour le moment"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden p-4 space-y-4">
              {currentBookings.length > 0 ? (
                currentBookings.map((booking: Booking) => {
                  const user = usersMap[booking.userId];
                  const activity = activitiesMap[booking.activity];

                  return (
                    <div
                      key={booking._id}
                      className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          <Book className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {activity?.title || "Activité inconnue"}
                          </span>
                        </h3>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Catégorie:</span> {booking.activityCategory}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Utilisateur</div>
                          <div className="text-sm font-medium">
                            {user ? `${user.firstName} ${user.lastName}` : "Inconnu"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Matricule</div>
                          <div className="text-sm font-medium">
                            {user?.matricule || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Statut</div>
                          <div className="text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === "confirmé" ? "bg-green-100 text-green-800" :
                              booking.status === "annulé" ? "bg-red-100 text-red-800" :
                              booking.status === "terminé" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Date</div>
                          <div className="text-sm font-medium">
                            {booking.bookingPeriod?.start ? new Date(booking.bookingPeriod.start).toLocaleDateString('fr-FR') : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          Détails
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookX className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Aucune réservation trouvée
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {filteredBookings.length === 0 && bookingsData.data.length > 0
                      ? "Aucune réservation ne correspond à vos critères"
                      : "Aucune réservation n'a été effectuée pour le moment"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}