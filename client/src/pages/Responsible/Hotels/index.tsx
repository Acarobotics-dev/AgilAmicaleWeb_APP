import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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
import { HotelTableRow } from "./HotelTableRow";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { getAllHotelsService } from "@/services";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Hotel } from "./types";
import {
  Building,
  Plus,
  Search,
  Building2,
  Info,
  Link,
  ExternalLink,
  Image as ImageIcon,
  Edit2,
  X,
  RotateCw,
  Star,
  MapPin,
  TrendingUp,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

// Loading skeleton component
function HotelsListSkeleton() {
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
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
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

export function HotelSection() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: hotelsData = { data: [] },
    isLoading,
    error,
    refetch,
  } = useQuery<{ data: Hotel[] }>({
    queryKey: ["hotels"],
    queryFn: getAllHotelsService,
  });

  const handleActionComplete = () => {
    refetch();
  };

  const hotels = hotelsData.data || [];

  // Filter hotels based on search
  const filteredHotels = hotels.filter((hotel: Hotel) => {
    return hotel.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHotels = filteredHotels.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleAddHotel = () => {
    navigate("/responsable/agences/add");
  };

  const handleEdit = (hotel: Hotel) => {
    navigate(`/responsable/agences/edit/${hotel._id}`);
  };

  // Calculate stats
  const stats = {
    total: hotels.length,
    filtered: filteredHotels.length,
  };

  if (isLoading) {
    return <HotelsListSkeleton />;
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
                Une erreur s'est produite lors du chargement des hôtels.
                Veuillez réessayer.
              </p>
              <Button
                onClick={() => refetch()}
                variant="destructive"
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
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des Hôtels
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{hotels.length} hôtels au total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{filteredHotels.length} hôtels visibles</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full"
                  onClick={handleAddHotel}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un Hôtel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {/* Total Hotels */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Total Hôtels
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtered/Visible Hotels */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Hôtels Visibles
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.filtered}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnerships (using total as proxy) */}
            <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">
                      Partenariats Actifs
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters Section */}
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
                      placeholder="Rechercher par nom d'hôtel..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    className="py-2.5"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      Réinitialiser
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Liste des hôtels
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {filteredHotels.length} résultats
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span>Hôtel</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Link className="w-4 h-4 text-blue-500" />
                        <span>Site Web</span>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentHotels.length > 0 ? (
                    currentHotels.map((hotel: Hotel) => (
                      <HotelTableRow
                        key={hotel._id}
                        hotel={hotel}
                        onActionComplete={handleActionComplete}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Aucun hôtel trouvé
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {filteredHotels.length === 0 && hotels.length > 0
                                ? "Aucun hôtel ne correspond à vos critères"
                                : "Aucun hôtel n'a été ajouté pour le moment"}
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
              {currentHotels.length > 0 ? (
                currentHotels.map((hotel: Hotel) => (
                  <Card
                    key={hotel._id}
                    className="p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                        {hotel.logo ? (
                          <img
                            src={hotel.logo}
                            alt={hotel.title}
                            className="w-8 h-8 object-contain rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">{hotel.title}</span>
                        </h3>
                        <a
                          href={hotel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="line-clamp-1">
                            Visiter le site web
                          </span>
                        </a>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(hotel)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Aucun hôtel trouvé
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {filteredHotels.length === 0 && hotels.length > 0
                      ? "Aucun hôtel ne correspond à vos critères"
                      : "Aucun hôtel n'a été ajouté pour le moment"}
                  </p>
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
