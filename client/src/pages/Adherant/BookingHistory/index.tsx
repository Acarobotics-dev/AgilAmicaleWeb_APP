import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,  } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Loader2, Calendar, Clock, DollarSign, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import NavbarSection from "@/components/navbar/navbar";
import { getUserBooking } from "@/services";
import Footer from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import { DataTable } from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { createTextColumn, createBadgeColumn, createDateColumn } from "@/components/common/table-columns";

interface BookingRow {
  id: string;
  title: string;
  category: string;
  periodText: string;
  durationText: string;
  isStay: boolean;
  priceText: string;
  status?: string;
  createdAt?: string;
  participantsCount?: number;
}

const statusVariants = {
  confirmé: { className: "bg-blue-100 text-blue-800", label: "Confirmé" },
  "en attente": { className: "bg-amber-100 text-amber-800", label: "En attente" },
  annulé: { className: "bg-red-100 text-red-800", label: "Annulé" },
  terminé: { className: "bg-emerald-100 text-emerald-800", label: "Terminé" },
  default: { className: "bg-gray-100 text-gray-800", label: "Inconnu" },
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

  // Data transformation
  const rows: BookingRow[] = useMemo(() => {
    return (bookingsData?.data || []).map((b: any) => {
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
      if (typeof activity.pricing === 'object' && activity.pricing?.basePrice) priceText = `${activity.pricing.basePrice} TND`;
      else if (typeof activity.pricing === 'number' && activity.pricing) priceText = `${activity.pricing} TND`;
      else if (activity.price && Array.isArray(activity.price) && b.bookingPeriod) {
        const match = activity.price.find((p: any) => {
          const pStart = new Date(p.week?.startdate).toISOString();
          const bStart = new Date(b.bookingPeriod.start).toISOString();
          return pStart === bStart;
        });
        if (match) priceText = `${match.price} TND`;
        else if (activity.price.length) priceText = `${activity.price[0].price} TND`;
      }

      const participantsCount = 1 + (b.participants?.length || 0);

      return {
        id: b._id,
        title,
        category,
        periodText,
        durationText,
        isStay,
        priceText,
        status: b.status || "en attente",
        createdAt: b.createdAt,
        participantsCount,
      };
    });
  }, [bookingsData]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const columns: ColumnDef<BookingRow>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Service",
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.title}</span>
    },
    createTextColumn<BookingRow>("category", "Catégorie"),
    createTextColumn<BookingRow>("periodText", "Période", { truncate: true, maxWidth: "220px" }),
    {
      id: "duration",
      header: "Durée",
      cell: ({ row }) => row.original.isStay ? row.original.durationText : "-"
    },
    createBadgeColumn<BookingRow>("status", "Statut", statusVariants),
    {
      accessorKey: "participantsCount",
      header: "Participants",
      cell: ({ row }) => <span className="text-sm text-gray-900">{row.original.participantsCount}</span>
    },
    createDateColumn<BookingRow>("createdAt", "Réservé le", { formatStr: "d MMM yyyy", showTime: false }),
    {
      accessorKey: "priceText",
      header: "Prix",
      cell: ({ row }) => <span className="font-semibold text-gray-700">{row.original.priceText}</span>
    },
  ], []);

  const ITEMS_PER_PAGE = 10;

  if (isLoading) {
    return (
      <>
        <NavbarSection />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chargement de vos réservations...</p>
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oups !</h3>
            <p className="text-gray-500 mb-6">Une erreur est survenue lors du chargement de vos réservations.</p>
            <Button onClick={() => refetch()} className="w-full">Réessayer</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavbarSection />

      <div className=" mx-auto px-4 py-24 space-y-8 min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes Réservations</h1>
              <p className="text-xs sm:text-sm text-gray-500">Consultez l'historique de vos activités</p>
            </div>
          </div>

          <div className="ml-auto w-full md:w-72">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm focus:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-hidden">
          <div className="p-4 bg-gray-50/50 flex justify-between items-center">
            <div className="font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Réservations récentes
            </div>
            <Badge variant="outline" className="bg-white">{filteredRows.length} résultats</Badge>
          </div>

          <div className="hidden sm:block p-0">
            <DataTable
              columns={columns}
              data={filteredRows}
              showSearch={false}
              showColumnVisibility={false}
              initialPageSize={ITEMS_PER_PAGE}
              emptyState={
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">Aucune réservation</h3>
                  <p className="text-gray-500 text-sm">Vous n'avez pas encore effectué de réservation.</p>
                </div>
              }
            />
          </div>

          {/* Mobile View */}
          <div className="sm:hidden p-4 space-y-4 bg-white">
                  {filteredRows.length > 0 ? filteredRows.map(row => (
              <div key={row.id} className="border border-gray-100 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{row.title}</h3>
                    <p className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1">{row.category}</p>
                  </div>
                  <Badge className={`${(statusVariants as any)[row.status as keyof typeof statusVariants]?.className || statusVariants.default.className} border-0 shadow-none`}>
                    {(statusVariants as any)[row.status as keyof typeof statusVariants]?.label || row.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm py-2 border-t border-b border-gray-50 my-2">
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Période</p>
                    <p className="font-medium text-gray-700">{row.periodText}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-gray-500 text-xs flex items-center justify-end gap-1">Durée <Clock className="w-3 h-3" /></p>
                    <p className="font-medium text-gray-700">{row.isStay ? row.durationText : "-"}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                  <div>
                    <span className="text-xs text-gray-400">ID: {row.id.slice(0, 8)}...</span>
                    <div className="text-sm text-gray-500">Réservé le: {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-900 font-bold">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      {row.priceText}
                    </div>
                    <div className="text-sm text-gray-600">Participants: <span className="font-medium text-gray-900">{row.participantsCount}</span></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500">
                <p>Aucun résultat trouvé pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};