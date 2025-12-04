import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HouseTableRow } from "./HouseTableRow";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { getAllHousesService } from "@/services";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { House } from "./types";
import {
  HousePlus,
  MapPin,
  Home,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Building,
  HousePlug,
  X,
  ChevronDown,
  RotateCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 8;

// Loading Skeleton Component
const HousesListSkeleton = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-white">
      <AppSidebar />
      <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
        {/* Header Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
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
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  </SidebarProvider>
);

export function HouseSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    availability: "",
    location: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: housesData = { data: [] },
    isLoading,
    error,
    refetch,
  } = useQuery<{ data: House[] }>({
    queryKey: ["houses"],
    queryFn: getAllHousesService,
  });

  const handleActionComplete = () => {
    refetch();
  };

  const houses = housesData.data || [];

  // Filtering and search logic
  const filteredHouses = houses.filter((house: House) => {
    const matchesAvailability =
      filters.availability === ""
        ? true
        : filters.availability === "available"
        ? house.isAvailable === true
        : house.isAvailable === false;
    const matchesLocation = filters.location
      ? house.location?.toLowerCase().includes(filters.location.toLowerCase())
      : true;
    const matchesSearch =
      house.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAvailability && matchesLocation && matchesSearch;
  });

  const totalPages = Math.ceil(filteredHouses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHouses = filteredHouses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Get unique locations for dropdown
  const uniqueLocations = Array.from(
    new Set(houses.map((house: House) => house.location).filter(Boolean))
  );

  // Calculate stats
  const stats = {
    total: houses.length,
    available: houses.filter((h: House) => h.isAvailable).length,
    unavailable: houses.filter((h: House) => !h.isAvailable).length,
    locations: uniqueLocations.length,
  };

  if (isLoading) {
    return <HousesListSkeleton />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
                <Info className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Erreur de chargement
              </h3>
              <p className="text-gray-500 mb-6">
                Une erreur s'est produite lors du chargement des maisons. Veuillez
                réessayer.
              </p>
              <Button
                onClick={() => refetch()}
                variant="destructive"
                className="px-6 py-3 rounded-full"
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
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="mt-1" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Maisons
                      </h1>
                    </div>
                    <p className="text-sm text-gray-500">
                      Gérez et organisez toutes vos propriétés
                    </p>
                  </div>
                </div>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/responsable/houses/add")}
                >
                  <HousePlus className="w-4 h-4 mr-2" />
                  Ajouter une Maison
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Maisons</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg shadow-lg">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Disponibles</p>
                    <p className="text-2xl font-bold text-green-900">{stats.available}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Indisponibles</p>
                    <p className="text-2xl font-bold text-red-900">{stats.unavailable}</p>
                  </div>
                  <div className="p-3 bg-red-500 rounded-lg shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Emplacements</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.locations}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-lg shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters Section */}
          <Card className="bg-blue-500/5 border-blue-200 mb-6">
            <CardContent className="p-6">
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
                      placeholder="Rechercher par titre, adresse ou emplacement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Disponibilité
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full pl-3 pr-4 py-2.5 border-input rounded-lg bg-white hover:bg-gray-100 justify-between font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <span>
                              {filters.availability === ""
                                ? "Toutes"
                                : filters.availability === "available"
                                ? "Disponible"
                                : "Indisponible"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[180px] p-2">
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              availability: "",
                            }))
                          }
                        >
                          {filters.availability === "" && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Toutes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              availability: "available",
                            }))
                          }
                        >
                          {filters.availability === "available" && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Disponible</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              availability: "unavailable",
                            }))
                          }
                        >
                          {filters.availability === "unavailable" && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Indisponible</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Emplacement
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full pl-3 pr-4 py-2.5 border-input rounded-lg bg-white hover:bg-gray-100 justify-between font-normal"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>
                              {filters.location || "Tous les emplacements"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[180px] p-2 max-h-60 overflow-y-auto">
                        <DropdownMenuItem
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, location: "" }))
                          }
                        >
                          {filters.location === "" && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span>Tous les emplacements</span>
                        </DropdownMenuItem>
                        {uniqueLocations.map((loc) => (
                          <DropdownMenuItem
                            key={String(loc)}
                            className="flex items-center gap-2 py-2 cursor-pointer"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                location: String(loc),
                              }))
                            }
                          >
                            {filters.location === loc && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="truncate">{String(loc)}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full py-2.5 border-input rounded-lg hover:bg-gray-100"
                      onClick={() => {
                        setFilters({ availability: "", location: "" });
                        setSearchQuery("");
                      }}
                    >
                    <span className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-gray-500" />
                      Réinitialiser
                    </span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                Liste des maisons
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredHouses.length} résultats
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4 text-blue-500" />
                        <span>Titre</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>Adresse</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span className="hidden md:inline">Description</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>Emplacement</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Disponibilité</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-900/90 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentHouses.length > 0 ? (
                    currentHouses.map((house: House) => (
                      <HouseTableRow
                        key={house._id}
                        house={house}
                        onActionComplete={handleActionComplete}
                        onEdit={() =>
                          navigate(`/responsable/houses/edit/${house._id}`)
                        }
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <HousePlug className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucune maison trouvée
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {filteredHouses.length === 0 && houses.length > 0
                                ? "Aucune maison ne correspond à vos critères"
                                : "Aucune maison n'a été ajoutée pour le moment"}
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
              {currentHouses.length > 0 ? (
                currentHouses.map((house: House) => (
                  <Card
                    key={house._id}
                    className="p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1 flex-1">
                        <Home className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="line-clamp-1">{house.title}</span>
                      </h3>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          house.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {house.isAvailable ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="hidden xs:inline">
                          {house.isAvailable ? "Disponible" : "Indisponible"}
                        </span>
                      </span>
                    </div>

                    <div className="mb-3 space-y-2">
                      <p className="text-sm text-gray-500 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{house.address}</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{house.location}</span>
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-2 text-sm">{house.description}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/responsable/houses/edit/${house._id}`)
                        }
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Building className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gray-100 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HousePlug className="w-8 h-8 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {filteredHouses.length === 0 && houses.length > 0
                        ? "Aucun résultat trouvé"
                        : "Aucune maison disponible"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      {filteredHouses.length === 0 && houses.length > 0
                        ? "Essayez de modifier vos critères de recherche"
                        : "Commencez par ajouter votre première maison"}
                    </p>
                  </div>
                  {filteredHouses.length === 0 && houses.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters({ availability: "", location: "" });
                      }}
                      className="mt-4"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Card className="p-3 shadow-sm">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </Card>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
export default HouseSection;