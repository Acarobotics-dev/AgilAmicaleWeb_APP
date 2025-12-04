/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Search, ExternalLink, Info, Filter } from "lucide-react";
import Footer from "@/components/footer";
import NavbarSection from "@/components/navbar/navbar";
import { useQuery } from "@tanstack/react-query";
import { getAllHotelsService } from "@/services";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { useNavigate } from "react-router-dom";
import { Hotel } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

const ITEMS_PER_PAGE = 9;

export default function HotelList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["hotels"],
    queryFn: getAllHotelsService,
    retry: 2,
  });

  // Map backend data to Hotel type
  const hotels = useMemo(() => {
    return (data?.data || []).map((hotel: Hotel) => ({
      _id: hotel._id,
      title: hotel.title,
      logo: hotel.logo,
      link: hotel.link,
    }));
  }, [data]);

  // Filtering logic with useMemo
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) =>
      hotel.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [hotels, searchTerm]);

  // Pagination logic with useMemo
  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const paginatedHotels = useMemo(() => {
    return filteredHotels.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredHotels, currentPage]);

  // Page change handler with useCallback
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedCard(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedCard(null);
  }, [searchTerm]);

  // Loading state similar to ConventionsPage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse" />
            <TailChase size={64} color="#eab308" />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chargement des hôtels
            </h3>
            <p className="text-gray-500">
              Veuillez patienter pendant que nous récupérons les données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state similar to ConventionsPage
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Erreur de chargement
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              Une erreur s'est produite lors du chargement des hôtels. Veuillez réessayer.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavbarSection />

      {/* Hero Section - Styled like ConventionsPage */}
      <div className="relative bg-gradient-to-br from-white via-white to-gray-50/20 pt-32 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,0,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse" />
            Nos Partenariats
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Hotels Partenaires
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12">
            Découvrez nos hôtels partenaires et profitez des offres exclusives
            pour vos séjours et activités.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{hotels.length}+</div>
              <div className="text-gray-500 font-medium">Partenaires</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-500 font-medium">Disponibilité</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-500 font-medium">Satisfaction</div>
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
                    placeholder="Rechercher un hôtel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 border-gray-200 rounded-2xl bg-gray-100 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-xl border border-gray-200">
                  <Filter className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-900/90 font-medium">
                    {filteredHotels.length} hôtel{filteredHotels.length > 1 ? "s" : ""} trouvé{filteredHotels.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {filteredHotels.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 mb-6">
                  <Search className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Aucun hôtel trouvé
                </h3>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  Nous n'avons pas trouvé d'hôtel correspondant à vos critères de recherche.
                </p>

              </div>
            </div>
          ) : (
            <>
              {/* Grid of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedHotels.map((hotel, index) => (
                  <div
                    key={hotel._id}
                    className="transform hover:-translate-y-2 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                      <div className="flex flex-col h-full">
                        {/* Logo and Basic Info */}
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-gray-100 border border-gray-100 rounded-lg p-3 flex-shrink-0">
                              <img
                                alt={hotel.title}
                                className="object-contain h-20 w-20"
                                src={
                                  hotel.logo.startsWith("http")
                                    ? hotel.logo
                                    : `${import.meta.env.VITE_API_BASE_URL}/${hotel.logo}`
                                }
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-logo.png";
                                }}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                                {hotel.title}
                              </CardTitle>
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                Partenaire
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer with Actions */}
                        <div className="mt-auto p-6 pt-3 border-t border-gray-50">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() => setExpandedCard(hotel._id)}
                              variant="outline"
                              className="flex-1 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-100 text-gray-900/90 hover:text-gray-900 transition-colors"
                            >
                              <Info className="w-4 h-4" />
                              Détails
                            </Button>
                            <Button
                              asChild
                              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-medium"
                            >
                              <a
                                href={hotel.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Site web
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
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

      {/* Modal for Details - Improved styling */}
      {paginatedHotels.map((hotel) => (
        <Dialog
          key={`dialog-${hotel._id}`}
          open={expandedCard === hotel._id}
          onOpenChange={(open) => setExpandedCard(open ? hotel._id : null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-0 border border-gray-200 shadow-2xl">
            <DialogHeader className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 border border-gray-100 rounded-lg p-3 shadow-sm">
                  <img
                    alt={hotel.title}
                    className="h-16 w-16 object-contain"
                    src={
                      hotel.logo.startsWith("http")
                        ? hotel.logo
                        : `${import.meta.env.VITE_API_BASE_URL}/${hotel.logo}`
                    }
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-logo.png";
                    }}
                  />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    {hotel.title}
                  </DialogTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Partenaire</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Hôtel</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-5 border border-gray-100 mb-6">
                <h3 className="font-medium text-gray-800 mb-3">À propos de cette agence</h3>
                <p className="text-gray-500">
                  Découvrez les services exceptionnels proposés par notre hôtel partenaire.
                  Visitez leur site web pour plus d'informations sur les offres disponibles
                  et les avantages exclusifs réservés aux membres de l'Amicale AGIL.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-2 mb-6 flex justify-center">
                <img
                  alt={hotel.title}
                  className="max-h-64 w-auto object-contain"
                  src={
                    hotel.logo && hotel.logo.startsWith("http")
                      ? hotel.logo
                      : `${import.meta.env.VITE_API_BASE_URL}/${hotel.logo}`
                  }
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-logo.png";
                  }}
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setExpandedCard(null)}
                  className="border-gray-200 hover:bg-gray-100"
                >
                  Fermer
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-medium"
                >
                  <a
                    href={hotel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visiter le site
                  </a>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
      <Footer />
    </>
  );
}
