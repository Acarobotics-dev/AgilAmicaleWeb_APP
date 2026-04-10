import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Loader2, Calendar, Clock, DollarSign, List, Pencil, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import NavbarSection from "@/components/navbar/navbar";
import { getUserBooking, getHouseByIdService, UserUpdateBookingService } from "@/services";
import Footer from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import { DataTable } from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { createTextColumn, createBadgeColumn, createDateColumn } from "@/components/common/table-columns";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  // raw fields needed for editing
  activityId: string;
  activityModel: string;
  rawParticipants: Array<{ firstName: string; lastName: string; age: number; type?: string }>;
  rawPeriod: { start: string; end: string } | null;
  eventCojoinPresence: boolean;
  eventChildPresence: boolean;
}

interface Participant {
  firstName: string;
  lastName: string;
  age: number | string;
  type: "cojoint" | "child";
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

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BookingRow | null>(null);
  const [saving, setSaving] = useState(false);

  // House edit state
  const [houseData, setHouseData] = useState<any>(null);
  const [houseLoading, setHouseLoading] = useState(false);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number | null>(null);

  // Event edit state
  const [participants, setParticipants] = useState<Participant[]>([]);

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
        activityId: activity._id || b.activity,
        activityModel: b.activityModel || (isStay ? "House" : "Event"),
        rawParticipants: b.participants || [],
        rawPeriod: b.bookingPeriod ? { start: b.bookingPeriod.start, end: b.bookingPeriod.end } : null,
        eventCojoinPresence: activity.cojoinPresence ?? false,
        eventChildPresence: activity.childPresence ?? false,
      };
    });
  }, [bookingsData]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  // Open edit dialog
  const openEdit = async (row: BookingRow) => {
    setEditingRow(row);
    setEditOpen(true);

    if (row.activityModel === "House") {
      setHouseLoading(true);
      setHouseData(null);
      setSelectedPeriodIndex(null);
      try {
        const res = await getHouseByIdService(row.activityId);
        const house = res.data;
        setHouseData(house);
        // Pre-select the current period
        if (row.rawPeriod && house?.price) {
          const idx = house.price.findIndex((p: any) => {
            const pStart = new Date(p.week.startdate).toISOString().split("T")[0];
            const bStart = new Date(row.rawPeriod!.start).toISOString().split("T")[0];
            return pStart === bStart;
          });
          setSelectedPeriodIndex(idx >= 0 ? idx : null);
        }
      } catch {
        toast.error("Impossible de charger les données de la maison.");
      } finally {
        setHouseLoading(false);
      }
    } else {
      // Pre-fill participants
      setParticipants(
        (row.rawParticipants || []).map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age,
          type: (p.type as "cojoint" | "child") || "cojoint",
        }))
      );
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingRow(null);
    setHouseData(null);
    setSelectedPeriodIndex(null);
    setParticipants([]);
  };

  const handleSave = async () => {
    if (!editingRow) return;
    setSaving(true);
    try {
      if (editingRow.activityModel === "House") {
        if (selectedPeriodIndex === null || !houseData) {
          toast.error("Veuillez sélectionner une période.");
          return;
        }
        const period = houseData.price[selectedPeriodIndex];
        await UserUpdateBookingService(editingRow.id, {
          bookingPeriod: {
            start: new Date(period.week.startdate).toISOString(),
            end: new Date(period.week.endDate).toISOString(),
          },
        });
      } else {
        const parsed = participants.map((p) => ({
          ...p,
          age: Number(p.age),
        }));
        await UserUpdateBookingService(editingRow.id, { participants: parsed });
      }
      toast.success("Réservation mise à jour avec succès.");
      refetch();
      closeEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Une erreur est survenue.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Participant helpers
  const addParticipant = (type: "cojoint" | "child") => {
    setParticipants((prev) => [...prev, { firstName: "", lastName: "", age: "", type }]);
  };
  const removeParticipant = (idx: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateParticipant = (idx: number, field: keyof Participant, value: string) => {
    setParticipants((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const isPeriodUnavailable = (period: any, unavailableDates: string[], currentPeriod?: { start: string; end: string } | null) => {
    if (!unavailableDates || unavailableDates.length === 0) return false;
    const pStart = new Date(period.week.startdate).toISOString().split("T")[0];
    // If this period matches the user's current booking period, always treat as available
    if (currentPeriod) {
      const bStart = new Date(currentPeriod.start).toISOString().split("T")[0];
      if (pStart === bStart) return false;
    }
    const start = new Date(period.week.startdate);
    const end = new Date(period.week.endDate);
    const dates: string[] = [];
    const cur = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
    while (cur <= endUTC) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return dates.some((d) => unavailableDates.includes(d));
  };

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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (row.original.status !== "en attente") return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5"
            onClick={() => openEdit(row.original)}
            title="Modifier la réservation"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        );
      },
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
                  <div className="flex items-center gap-2">
                    <Badge className={`${(statusVariants as any)[row.status as keyof typeof statusVariants]?.className || statusVariants.default.className} border-0 shadow-none`}>
                      {(statusVariants as any)[row.status as keyof typeof statusVariants]?.label || row.status}
                    </Badge>
                    {row.status === "en attente" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 h-auto"
                        onClick={() => openEdit(row)}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">{editingRow?.title}</p>
          </DialogHeader>

          {editingRow?.activityModel === "House" ? (
            <div className="space-y-3 py-2">
              <p className="text-sm font-medium text-gray-700">Sélectionnez une nouvelle période :</p>
              {houseLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : houseData?.price?.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {houseData.price.map((p: any, idx: number) => {
                    const unavailable = isPeriodUnavailable(p, houseData.unavailableDates || [], editingRow?.rawPeriod);
                    const start = new Date(p.week.startdate).toLocaleDateString("fr-FR");
                    const end = new Date(p.week.endDate).toLocaleDateString("fr-FR");
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          unavailable
                            ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                            : selectedPeriodIndex === idx
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="period"
                          disabled={unavailable}
                          checked={selectedPeriodIndex === idx}
                          onChange={() => setSelectedPeriodIndex(idx)}
                          className="accent-blue-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">{start} → {end}</span>
                          <span className="ml-2 text-xs text-emerald-600 font-semibold">{p.price} TND</span>
                          {unavailable && <span className="ml-2 text-xs text-red-500">Indisponible</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Aucune période disponible.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Companions */}
              {(editingRow?.eventCojoinPresence || participants.some(p => p.type === "cojoint")) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Accompagnants</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 text-xs h-auto py-1"
                      onClick={() => addParticipant("cojoint")}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {participants.filter(p => p.type === "cojoint").length === 0 && (
                    <p className="text-xs text-gray-400">Aucun accompagnant ajouté.</p>
                  )}
                  {participants.map((p, idx) => p.type !== "cojoint" ? null : (
                    <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        placeholder="Prénom"
                        value={p.firstName}
                        onChange={(e) => updateParticipant(idx, "firstName", e.target.value)}
                        className="text-sm h-9"
                      />
                      <Input
                        placeholder="Nom"
                        value={p.lastName}
                        onChange={(e) => updateParticipant(idx, "lastName", e.target.value)}
                        className="text-sm h-9"
                      />
                      <div className="flex gap-1 items-center">
                        <Input
                          placeholder="Âge"
                          type="number"
                          min={0}
                          value={p.age}
                          onChange={(e) => updateParticipant(idx, "age", e.target.value)}
                          className="text-sm h-9"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 p-1.5 h-9 w-9"
                          onClick={() => removeParticipant(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Children */}
              {(editingRow?.eventChildPresence || participants.some(p => p.type === "child")) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Enfants</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 text-xs h-auto py-1"
                      onClick={() => addParticipant("child")}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {participants.filter(p => p.type === "child").length === 0 && (
                    <p className="text-xs text-gray-400">Aucun enfant ajouté.</p>
                  )}
                  {participants.map((p, idx) => p.type !== "child" ? null : (
                    <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        placeholder="Prénom"
                        value={p.firstName}
                        onChange={(e) => updateParticipant(idx, "firstName", e.target.value)}
                        className="text-sm h-9"
                      />
                      <Input
                        placeholder="Nom"
                        value={p.lastName}
                        onChange={(e) => updateParticipant(idx, "lastName", e.target.value)}
                        className="text-sm h-9"
                      />
                      <div className="flex gap-1 items-center">
                        <Input
                          placeholder="Âge"
                          type="number"
                          min={0}
                          value={p.age}
                          onChange={(e) => updateParticipant(idx, "age", e.target.value)}
                          className="text-sm h-9"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 p-1.5 h-9 w-9"
                          onClick={() => removeParticipant(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!editingRow?.eventCojoinPresence && !editingRow?.eventChildPresence && participants.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Cet événement ne permet pas l'ajout de participants supplémentaires.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEdit} disabled={saving}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || houseLoading}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};
