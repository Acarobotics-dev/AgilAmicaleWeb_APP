import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Eye,
  Info,
  GalleryHorizontal,
  BedDouble,
  Bath,
  CalendarCheck,
  CalendarX2,
  BadgeDollarSign,
  Settings2,
  AlignLeft,
  ArrowLeft,
  Home,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { getHouseByIdService } from "@/services";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { House } from "./types";

export const HouseDetailsPage = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      if (!houseId) {
        setError("ID de la maison non fourni");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getHouseByIdService(houseId);
        setHouse(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch house details:", err);
        setError("Erreur lors du chargement des détails de la maison");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseDetails();
  }, [houseId]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <TailChase size="64" speed="1.75" color="#3b82f6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chargement des détails de la maison
              </h3>
              <p className="text-gray-500">Veuillez patienter...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !house) {
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
                {error || "Maison non trouvée"}
              </p>
              <Button
                onClick={() => navigate("/responsable/houses")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-white to-gray-50/20">
        <AppSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <SidebarTrigger className="mt-1" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          Détails de la maison
                        </h1>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Affichage des détails</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>ID: {house._id.slice(-8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Propriété: "{house.title}"</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        house.isAvailable
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {house.isAvailable ? "Disponible" : "Indisponible"}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/responsable/houses")}
                      className="bg-gray-100 hover:bg-gray-100 border-gray-200 text-gray-900/90 px-5 py-2.5 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour à la liste
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-100/20 to-gray-100/30 px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Informations détaillées de la propriété
                </h2>
                <p className="text-gray-500 mt-1">
                  Consultez toutes les informations relatives à cette propriété.
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-8">
                  {/* Image Gallery Section */}
                  {house.images && house.images.length > 0 && (
                    <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <GalleryHorizontal className="w-5 h-5 text-white" />
                        </div>
                        Galerie Photos
                      </h3>
                      <div className="bg-white rounded-xl p-4 border border-purple-200">
                        <Carousel className="rounded-xl overflow-hidden shadow-lg">
                          <CarouselContent>
                            {house.images.map((imagePath, index) => (
                              <CarouselItem key={index}>
                                <div className="relative aspect-video rounded-xl overflow-hidden">
                                  <img
                                    src={`${
                                      import.meta.env.VITE_API_BASE_URL
                                    }/${imagePath}`}
                                    alt={`Photo ${index + 1} de la propriété`}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {index + 1} / {house.images.length}
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-4 bg-white/95 hover:bg-white border-0 shadow-lg" />
                          <CarouselNext className="right-4 bg-white/95 hover:bg-white border-0 shadow-lg" />
                        </Carousel>
                      </div>
                    </section>
                  )}

                  {/* Property Overview */}
                  <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      Informations Générales
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <BedDouble className="w-4 h-4 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Chambres
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {house.numberOfRooms}
                          </p>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Bath className="w-4 h-4 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Salles de bain
                            </h4>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {house.numberOfBathrooms}
                          </p>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Info className="w-4 h-4 text-orange-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Adresse
                            </h4>
                          </div>
                          <p className="text-sm text-gray-900/90 bg-white px-3 py-2 rounded-lg border">
                            {house.address}
                          </p>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 md:col-span-2 xl:col-span-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <Info className="w-4 h-4 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Localisation
                            </h4>
                          </div>
                          <p className="text-sm text-gray-900/90 bg-white px-3 py-2 rounded-lg border">
                            {house.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>


                  {/* Pricing Section */}
                  <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <BadgeDollarSign className="w-5 h-5 text-white" />
                      </div>
                      Tarification par Semaine
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-orange-200">
                      <div className="space-y-4">
                        {house.price.map((entry, index) => {
                          const { startdate, endDate } = entry.week;
                          return (
                            <div
                              key={index}
                              className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-orange-100 rounded-lg">
                                    <CalendarCheck className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 mb-1">
                                      Période {index + 1}
                                    </p>
                                    <div className="text-sm text-gray-500">
                                      <span className="font-medium text-gray-800">
                                        {new Date(startdate).toLocaleDateString(
                                          "fr-FR",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        )}
                                      </span>
                                      <span className="mx-2 text-gray-500/80">
                                        →
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {new Date(endDate).toLocaleDateString(
                                          "fr-FR",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-xl px-4 py-3 border border-orange-200 shadow-sm">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Prix par semaine
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600">
                                      {entry.price}
                                      <span className="text-sm font-medium text-gray-500 ml-1">
                                        TND
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(!house.price || house.price.length === 0) && (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                              <BadgeDollarSign className="w-8 h-8 text-gray-500/80" />
                            </div>
                            <p className="text-gray-500">
                              Aucune tarification définie
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Amenities Section */}
                  {house.amenities.length > 0 && (
                    <section className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-teal-500 rounded-lg">
                          <Settings2 className="w-5 h-5 text-white" />
                        </div>
                        Équipements & Services
                      </h3>
                      <div className="bg-white rounded-xl p-6 border border-teal-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {house.amenities.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors duration-200"
                            >
                              <div className="p-2 bg-teal-500 rounded-lg">
                                <Settings2 className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Description Section */}
                  <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <AlignLeft className="w-5 h-5 text-white" />
                      </div>
                      Description Détaillée
                    </h3>
                    <div className="bg-white rounded-xl p-6 border border-indigo-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900/90 leading-relaxed whitespace-pre-wrap">
                          {house.description}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
