/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Info } from "lucide-react";
import Footer from "@/components/footer";
import NavbarSection from "@/components/navbar/navbar";
import { useQuery } from "@tanstack/react-query";
import { getAllEvents } from "@/services";
import { PaginationComponent } from "@/components/common/paginationComponent";
import { useNavigate } from "react-router-dom";
import { Event, EventType } from "./types";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 9;

export default function EvenementsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    EventType | "all" | ""
  >(""); // category filter
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Derived data (must run unconditionally to preserve hook order)
  const events: Event[] = (data?.data || []) as Event[];

  const categories: EventType[] = Array.from(
    new Set(events.map((e) => e.type).filter(Boolean))
  ) as EventType[];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((event as any).destination || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ((event as any).location || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || !selectedCategory || event.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Show spinner while loading
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
              Chargement des événements
            </h3>
            <p className="text-gray-500">
              Veuillez patienter pendant que nous récupérons les données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100/20">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Erreur de chargement
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              Une erreur s'est produite lors du chargement des événements. Veuillez
              réessayer.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-2 rounded-full"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-gray-50/20">
      <NavbarSection />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-white via-white to-gray-50/20 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,0,0.06),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-5 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-6 shadow-sm">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse" />
            Événements
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Nos événements
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
            Découvrez les événements à venir et passés organisés par notre
            association.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {events.length}
              </div>
              <div className="text-gray-500 font-medium">Total événements</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {filteredEvents.length}
              </div>
              <div className="text-gray-500 font-medium">Résultats</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {totalPages}
              </div>
              <div className="text-gray-500 font-medium">Pages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white mb-6">
          <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500/80" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 border-gray-200 rounded-2xl bg-gray-100 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 text-lg w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="category" className="text-sm font-medium">Catégorie :</Label>
              <Select value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
                <SelectTrigger className="w-56 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-gray-500 text-sm">
              {filteredEvents.length} résultat
              {filteredEvents.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedEvents.map((event) => (
            <Card
              key={event._id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl"
            >
              <div className="relative overflow-hidden rounded-t-3xl">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL
                    }/${event.featuredPhoto || "placeholder-event.jpg"}`}
                  alt={event.title || "Image événement"}
                  className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors uppercase mb-2">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {event.type}
                  </Badge>
                  <Badge
                    className={
                      event.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {event.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                {event.createdAt && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                    Créé le{" "}
                    {new Date(event.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                )}
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                  {event.description
                    ? event.description.length > 120
                      ? event.description.slice(0, 120) + "..."
                      : event.description
                    : ""}
                </p>
                <hr className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => navigate(`/evenements/${event._id}`)}
                      className="rounded-full px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900"
                    >
                      Détails
                    </Button>
                  </div>
                  <div className="text-xl font-semibold bg-gradient-to-r from-yellow-600 to-yellow-400 text-transparent bg-clip-text">
                    {event.basePrice !== undefined
                      ? `${event.basePrice} TND`
                      : "Prix N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 mb-6">
                <Search className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun événement trouvé</h3>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Nous n'avons pas trouvé d'événement correspondant à vos critères de recherche.
              </p>

            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
