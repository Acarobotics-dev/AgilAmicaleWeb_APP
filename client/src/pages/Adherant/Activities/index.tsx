"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Filter,
  Wifi,
  Waves,
  Bath,
  BedDouble,
  Sofa,
  ThermometerSun,
  Tv,
  Boxes,
  Laptop,
  TreeDeciduous,
  PanelsTopLeft,
  Columns4,
  Table,
  DoorOpen,
  ParkingCircle,
  Fence,
  Camera,
  Home,
  Star,
  SlidersHorizontal,
  X,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,

} from "@/components/ui/dialog";
import Footer from "@/components/footer";
import NavbarSection from "@/components/navbar/navbar";
import { useQuery } from "@tanstack/react-query";
import { getAllHousesService } from "@/services";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { useNavigate } from "react-router-dom";
import { House } from "./types";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

// Constants
const ITEMS_PER_PAGE = 10;
const AMENITIES_OPTIONS = [
  { label: "Entièrement meublé", icon: Sofa },
  { label: "Climatisation / Chauffage", icon: ThermometerSun },
  { label: "Télévision intelligente", icon: Tv },
  { label: "Internet / Wi-Fi", icon: Wifi },
  { label: "Placards intégrés / Rangements", icon: Boxes },
  { label: "Bureau / Espace de télétravail", icon: Laptop },
  { label: "Baignoire / Douche à l'italienne", icon: Bath },
  { label: "Jardin privé", icon: TreeDeciduous },
  { label: "Balcon / Terrasse", icon: PanelsTopLeft },
  { label: "Espace barbecue", icon: Columns4 },
  { label: "Piscine", icon: Waves },
  { label: "Coin repas / salon extérieur", icon: Table },
  { label: "Entrée privée", icon: DoorOpen },
  { label: "Garage / Parking couvert", icon: ParkingCircle },
  { label: "Propriété clôturée", icon: Fence },
  { label: "Système de sécurité / Caméras", icon: Camera },
];

const AMENITIES_ICON_MAP = Object.fromEntries(
  AMENITIES_OPTIONS.map((opt) => [opt.label, opt.icon])
);

// Custom hook for filtering logic
const useHouseFilters = (houses: House[]) => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedLocation: "",
    selectedRooms: "",
    selectedBathrooms: "",
    minPrice: "",
    maxPrice: "",
    selectedAmenities: [] as string[],
    sortBy: "price",
  });

  const updateFilter = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      selectedLocation: "",
      selectedRooms: "",
      selectedBathrooms: "",
      minPrice: "",
      maxPrice: "",
      selectedAmenities: [],
      sortBy: "price",
    });
  }, []);

  const filteredHouses = useMemo(() => {
    return houses
      .filter((house) => {
        const matchesSearch =
          house.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          house.location.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesLocation = !filters.selectedLocation || house.location === filters.selectedLocation;

        const matchesRooms = !filters.selectedRooms || house.numberOfRooms === Number(filters.selectedRooms);

        const matchesBathrooms = !filters.selectedBathrooms ||
          house.numberOfBathrooms === Number(filters.selectedBathrooms);

        const matchesAmenities = filters.selectedAmenities.length === 0 ||
          filters.selectedAmenities.every((amenity) => house.amenities.includes(amenity));

        const matchesPrice = () => {
          if (!filters.minPrice && !filters.maxPrice) return true;
          if (!house.price || house.price.length === 0) return false;

          const prices = house.price.map((p) => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);

          if (filters.minPrice && filters.maxPrice) {
            return max >= Number(filters.minPrice) && min <= Number(filters.maxPrice);
          }
          if (filters.minPrice) {
            return max >= Number(filters.minPrice);
          }
          if (filters.maxPrice) {
            return min <= Number(filters.maxPrice);
          }
          return true;
        };

        return matchesSearch && matchesLocation && matchesRooms &&
               matchesBathrooms && matchesAmenities && matchesPrice();
      })
      .sort((a, b) => {
        if (filters.sortBy === "price") {
          const aMin = a.price.length ? Math.min(...a.price.map((p) => p.price)) : 0;
          const bMin = b.price.length ? Math.min(...b.price.map((p) => p.price)) : 0;
          return aMin - bMin;
        }
        if (filters.sortBy === "rooms") return b.numberOfRooms - a.numberOfRooms;
        if (filters.sortBy === "name") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [houses, filters]);

  return { filters, updateFilter, clearFilters, filteredHouses };
};

// Loading component
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
    <NavbarSection />
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse" />
        <TailChase size={64} color="#eab308" />
      </div>
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Chargement des logements
        </h3>
        <p className="text-gray-500">
          Veuillez patienter pendant que nous récupérons les données...
        </p>
      </div>
    </div>
  </div>
);

// Error component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
    <NavbarSection />
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Erreur de chargement
        </h3>
        <p className="text-gray-500 text-lg mb-8">
          Une erreur s'est produite lors du chargement des logements. Veuillez
          réessayer.
        </p>
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
        >
          Réessayer
        </Button>
      </div>
    </div>
  </div>
);

// House Card component
const HouseCard = ({
  house,
  onClick
}: {
  house: House;
  onClick: () => void;
}) => {
  const minPrice = house.price.length ? Math.min(...house.price.map(p => p.price)) : 0;

  // Format available period for display (dd/mm/yyyy - dd/mm/yyyy)
  const availablePeriodText = (house.availablePeriod && house.availablePeriod.length === 2)
    ? `Disponible: ${new Date(house.availablePeriod[0]).toLocaleDateString('fr-FR')} - ${new Date(house.availablePeriod[1]).toLocaleDateString('fr-FR')}`
    : 'Période non spécifiée';

  return (
    <div className="transform hover:-translate-y-2 transition-all duration-300 h-full">
      <Card
        className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl cursor-pointer h-full"
        onClick={onClick}
        role="article"
        aria-label={`Logement: ${house.title}`}
      >
        <div className="relative overflow-hidden h-56">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/${house.images?.[0] || "placeholder-house.jpg"}`}
            alt={house.title || "Image logement"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300" />

          <div className="absolute top-4 left-4">
            <Badge className={`${house.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white border-0 shadow-lg px-3 py-1.5`}>
              {house.isAvailable ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>

          <div className="absolute bottom-4 right-4">
            <Badge className="bg-white text-gray-900 border-0 shadow-lg px-3 py-1.5 font-bold">
              {minPrice} TND
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors mb-2 line-clamp-2">
              {house.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{house.location}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">{availablePeriodText}</div>
          </div>

          <div className="flex items-center gap-6 mb-4 text-gray-500">
            <div className="flex items-center gap-1">
              <BedDouble className="w-5 h-5" />
              <span className="font-medium">{house.numberOfRooms} chambre{house.numberOfRooms > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-5 h-5" />
              <span className="font-medium">{house.numberOfBathrooms} sdb</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {house.amenities.slice(0, 3).map((amenity) => {
              const Icon = AMENITIES_ICON_MAP[amenity];
              return (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="text-xs px-3 py-1 border-yellow-200 text-yellow-700 bg-yellow-50 flex items-center gap-1"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {amenity.length > 12 ? `${amenity.substring(0, 12)}...` : amenity}
                </Badge>
              );
            })}
            {house.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 border-gray-200 text-gray-500">
                +{house.amenities.length - 3}
              </Badge>
            )}
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Voir détails
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Filters Dialog component (uses shadcn Dialog)
const FiltersDialog = ({
  filters,
  updateFilter,
  clearFilters,
  houses,
  isOpen,
  onClose
}: {
  filters: any;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  houses: House[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const handleAmenityChange = useCallback((amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.selectedAmenities, amenity]
      : filters.selectedAmenities.filter((a: string) => a !== amenity);

    updateFilter("selectedAmenities", newAmenities);
  }, [filters.selectedAmenities, updateFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl w-full p-0 rounded-3xl">
        <div className="bg-white rounded-3xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-gray-100/20 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-yellow-600" />
                Filtres avancés
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Localisation</Label>
                  <Select
                    value={filters.selectedLocation}
                    onValueChange={(value) => updateFilter("selectedLocation", value)}
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-yellow-400 rounded-lg">
                      <SelectValue placeholder="Toutes les localisations" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(houses.map((h) => h.location))]
                        .filter((loc) => loc && loc.trim() !== "")
                        .map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Budget (TND)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter("minPrice", e.target.value)}
                      className="h-12 border-gray-200 focus:border-yellow-400 rounded-lg"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter("maxPrice", e.target.value)}
                      className="h-12 border-gray-200 focus:border-yellow-400 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Chambres</Label>
                    <Select
                      value={filters.selectedRooms}
                      onValueChange={(value) => updateFilter("selectedRooms", value)}
                    >
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Salles de bain</Label>
                    <Select
                      value={filters.selectedBathrooms}
                      onValueChange={(value) => updateFilter("selectedBathrooms", value)}
                    >
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Équipements</Label>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                  {AMENITIES_OPTIONS.map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                      <Checkbox
                        id={`filter-${label}`}
                        checked={filters.selectedAmenities.includes(label)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(label, checked as boolean)
                        }
                        className="border-gray-300 text-yellow-500"
                      />
                      <Label
                        htmlFor={`filter-${label}`}
                        className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                      >
                        <Icon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-gray-900/90">{label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-100 flex justify-between">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="px-6 border-gray-300 hover:bg-gray-100"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={onClose}
              className="px-8 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 border-0"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ActivityList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["houses"],
    queryFn: getAllHousesService,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process houses data
  const houses = useMemo(() => {
    return (data?.data || []).map((house: House): House => ({
      _id: house._id,
      title: house.title,
      description: house.description,
      location: house.location || house.address,
      address: house.address || "",
      price: house.price || [],
      numberOfRooms: house.numberOfRooms,
      numberOfBathrooms: house.numberOfBathrooms || 1,
      amenities: house.amenities || [],
      images: house.images || [],
      isAvailable: house.isAvailable ?? true,
      postedAt: house.postedAt || "",
      availablePeriod: house.availablePeriod || [],
      unavailableDates: house.unavailableDates || [],
    }));
  }, [data]);

  const { filters, updateFilter, clearFilters, filteredHouses } = useHouseFilters(houses);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredHouses.length / ITEMS_PER_PAGE);
  const paginatedHouses = useMemo(() => {
    return filteredHouses.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredHouses, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  const handleRedirectToDetails = useCallback((houseId: string) => {
    navigate(`/activities/${houseId}`);
  }, [navigate]);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <>
      <NavbarSection />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-white to-gray-50/20 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,0,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse" />
            Nos Hébergements
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Logements Premium
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-4">
            Découvrez notre sélection de logements d'exception avec des équipements
            modernes et des emplacements privilégiés pour vos séjours.
          </p>

          {/* Available Period */}
          <p className="text-sm md:text-base text-gray-500 max-w-3xl mx-auto leading-relaxed">
            <strong>Période disponible :</strong>{" "}
            {houses.length > 0 && houses[0].availablePeriod.length === 2
              ? `Du ${new Date(houses[0].availablePeriod[0]).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })} au ${new Date(houses[0].availablePeriod[1]).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}`
              : "Non spécifiée"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{filteredHouses.length}+</div>
              <div className="text-gray-500 font-medium">Logements</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <div className="text-gray-500 font-medium">Note moyenne</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-500 font-medium">Support client</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="w-full lg:w-96">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500/80 group-focus-within:text-yellow-500 transition-colors" />
                  <Input
                    placeholder="Rechercher un logement..."
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter("searchTerm", e.target.value)}
                    className="pl-12 h-14 border-gray-200 rounded-2xl bg-gray-100 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtres avancés</span>
                </Button>

                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-xl border border-gray-200">
                  <Home className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-900/90 font-medium">
                    {filteredHouses.length} logement{filteredHouses.length > 1 ? "s" : ""} trouvé{filteredHouses.length > 1 ? "s" : ""}
                  </span>
                </div>

                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter("sortBy", value)}
                >
                  <SelectTrigger className="h-12 px-4 bg-gray-100 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Prix croissant</SelectItem>
                    <SelectItem value="rooms">Nombre de chambres</SelectItem>
                    <SelectItem value="name">Nom A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filters Dialog */}
          <FiltersDialog
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            houses={houses}
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
          />

          {/* Main Content */}
          {filteredHouses.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 mb-6">
                  <Search className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Aucun logement trouvé
                </h3>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  Nous n'avons pas trouvé de logement correspondant à vos critères de recherche.
                </p>

              </div>
            </div>
          ) : (
            <>
              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedHouses.map((house, index) => (
                  <HouseCard
                    key={house._id}
                    house={house}
                    onClick={() => handleRedirectToDetails(house._id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center">
                  <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}