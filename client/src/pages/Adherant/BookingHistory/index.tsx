import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import NavbarSection from "@/components/navbar/navbar";
import { getUserBooking } from "@/services";
import Footer from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import { PaginationComponent } from "@/components/common/paginationComponent";

interface Booking {
  id: string;
  service?: string;
  consultant?: string;
  date?: string;
  time?: string;
  duration?: number;
  status?: string;
  price?: number;
  notes?: string;
}

const getStatusColor = (status: string | undefined) => {
  if (!status) return "bg-gray-100 text-gray-500";
  const s = status.toString().toLowerCase();
  if (s.includes("confirm" ) || s.includes("confirmé")) return "bg-info text-info-foreground";
  if (s.includes("termin") || s.includes("completed") || s.includes("terminé")) return "bg-success text-success-foreground";
  if (s.includes("attente") || s.includes("pending")) return "bg-warning text-warning-foreground";
  if (s.includes("annul") || s.includes("cancel")) return "bg-destructive text-destructive-foreground";
  return "bg-gray-100 text-gray-500";
};

const getStatusText = (status: string | undefined) => {
  if (!status) return "En attente";
  const s = status.toString().toLowerCase();
  if (s.includes("confirm" ) || s.includes("confirmé")) return "Confirmé";
  if (s.includes("termin") || s.includes("completed") || s.includes("terminé")) return "Terminé";
  if (s.includes("attente") || s.includes("pending")) return "En attente";
  if (s.includes("annul") || s.includes("cancel")) return "Annulé";
  return status;
};

export const MyBookings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const userId = auth?.user?._id;

  const { data: bookingsData = { data: [] }, isLoading, error, refetch } = useQuery({
    queryKey: ["userBookings", userId],
    queryFn: () => getUserBooking(userId!),
    enabled: !!userId,
  });

  // derive rows from API payload
  const rows = (bookingsData?.data || []).map((b: any) => {
    const activity = b.activity || {};
    const title = activity.title || activity.destination || "N/A";
    const category = b.activityCategory || activity.type || "N/A";

    const start = b.bookingPeriod?.start ?? activity.startDate ?? null;
    const end = b.bookingPeriod?.end ?? activity.endDate ?? null;
    const periodText = start && end
      ? `${new Date(start).toLocaleDateString('fr-FR')} - ${new Date(end).toLocaleDateString('fr-FR')}`
      : (start ? new Date(start).toLocaleDateString('fr-FR') : 'N/A');

    const isStay = (b.activityCategory || "").toString().toLowerCase() === "sejour maison";

    let durationText = '-';
    if (activity.durationHours) durationText = `${activity.durationHours} h`;
    else if (start && end) {
      const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
      durationText = `${diff} j`;
    }

    let priceText = 'N/A';
    if (activity.pricing?.basePrice) priceText = `${activity.pricing.basePrice} TND`;
    else if (activity.price && Array.isArray(activity.price) && b.bookingPeriod) {
      const match = activity.price.find((p: any) => {
        const pStart = new Date(p.week?.startdate).toISOString();
        const bStart = new Date(b.bookingPeriod.start).toISOString();
        return pStart === bStart;
      });
      if (match) priceText = `${match.price} TND`;
      else if (activity.price.length) priceText = `${activity.price[0].price} TND`;
    }

    return {
      id: b._id,
      title,
      category,
      periodText,
      durationText,
      isStay,
      priceText,
      status: b.status,
      createdAt: b.createdAt,
    } as Booking & { periodText: string; durationText: string; isStay: boolean; priceText: string };
  });

  const filteredRows = rows.filter((r: any) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [searchTerm, bookingsData?.data?.length]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <>
        <NavbarSection />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <TailChase size={48} color="#f59e0b" />
            <p className="mt-4 text-gray-500">Chargement de vos réservations...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarSection />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement des réservations.</p>
            <Button onClick={() => refetch()}>Réessayer</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavbarSection />

      <div className="max-w-7xl mx-auto px-4 py-24 space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 p-2 rounded-md">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">MJ</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
              <p className="text-sm text-gray-500">Consultez et gérez vos réservations</p>
            </div>
          </div>

          <div className="ml-auto w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500/80" />
              <Input
                placeholder="Rechercher des réservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-lg border-gray-200 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Réservations récentes</h2>
          </div>

          <div className="p-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Période</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentRows.length > 0 ? (
                  currentRows.map((booking: any) => (
                    <TableRow key={booking.id} className="hover:bg-gray-100">
                      <TableCell className="px-4 py-3">
                        <div>
                          <div className="font-medium">{booking.title}</div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">{booking.category}</TableCell>

                      <TableCell className="px-4 py-3">{booking.periodText}</TableCell>

                      <TableCell className="px-4 py-3">{booking.isStay ? booking.durationText : "-"}</TableCell>

                      <TableCell className="px-4 py-3">
                        <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3">{booking.priceText}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-gray-500/80" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Aucun résultat</h3>
                        <p className="text-sm text-gray-500">Aucune réservation ne correspond à vos critères.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-center">
                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};