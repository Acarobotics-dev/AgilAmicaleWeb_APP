import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Eye, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { DeleteBookingService, UpdateBookingStatusService } from "@/services";
import { toast } from "sonner";
import { Booking, User, House, Event } from "./types";
import {
  User as UserIcon,
  Calendar as CalendarIcon,
  Home,
  Info,
  ClipboardList,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingTableRowProps {
  booking: Booking;
  usersMap: Record<string, User>;
  activitiesMap: Record<string, House | Event>;
  onActionComplete?: () => void;
}

export function BookingTableRow({
  booking,
  usersMap,
  activitiesMap,
  onActionComplete,
}: BookingTableRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(booking.status || "en attente");

  // Get user and activity from maps
  const user = usersMap[booking.userId];
  const activity = activitiesMap[booking.activity];

  // Get activity name and category (needed before computing displayPeriod)
  const activityName = activity?.title || "Activité inconnue";
  const activityCategory = booking.activityCategory || "sejour Maison";

  const handleDelete = async () => {
    try {
      if (!booking._id) throw new Error("Missing booking ID");
      await DeleteBookingService(booking._id);
      toast.success("Réservation supprimée avec succès !");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression:", err);
      toast.error("Impossible de supprimer la réservation.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!booking._id) throw new Error("Missing booking ID");
      await UpdateBookingStatusService(booking._id, selectedStatus);
      toast.success("Statut mis à jour avec succès !");
      onActionComplete?.();
      setIsStatusDialogOpen(false);
    } catch (err) {
      console.error("Échec de la mise à jour du statut:", err);
      toast.error("Impossible de mettre à jour le statut.");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "confirmé":
        return "bg-green-100 text-green-800";
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      case "terminé":
        return "bg-gray-100 text-gray-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmé":
        return "bg-green-100 border-green-500 text-green-700";
      case "en attente":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      case "annulé":
        return "bg-red-100 border-red-500 text-red-700";
      case "terminé":
        return "bg-gray-100 border-gray-200 text-gray-900/90";
      default:
        return "bg-gray-100 border-gray-200 text-gray-900/90";
    }
  };

  // Display logic: if category is 'sejour Maison' show booking.bookingPeriod, otherwise show booking.startDate/endDate
  const bookingPeriodFromRange =
    booking.bookingPeriod && booking.bookingPeriod.start && booking.bookingPeriod.end
      ? `${new Date(booking.bookingPeriod.start).toLocaleDateString('fr-FR')} - ${new Date(booking.bookingPeriod.end).toLocaleDateString('fr-FR')}`
      : null;

  const bookingPeriodFromDates =
    (booking as any).startDate && (booking as any).endDate
      ? `${new Date((booking as any).startDate).toLocaleDateString('fr-FR')} - ${new Date((booking as any).endDate).toLocaleDateString('fr-FR')}`
      : null;

  const displayPeriod =
    (activityCategory || "").toString().toLowerCase() === "sejour maison"
      ? bookingPeriodFromRange || bookingPeriodFromDates || "N/A"
      : bookingPeriodFromDates || bookingPeriodFromRange || "N/A";

  // Get user display info
  const userDisplay = user
    ? `${user.firstName || "Utilisateur"} ${user.lastName || "Utilisateur"}`
    : "Utilisateur inconnu";
  const matriculeDisplay = user
    ? `${user.matricule}`
    : "Utilisateur inconnu";

  return (
    <>
      <TableRow key={booking._id} className="hover:bg-gray-100">
        <TableCell className="px-4 sm:px-6 py-4">{activityName}</TableCell>
        <TableCell className="px-4 sm:px-6 py-4">{activityCategory}</TableCell>
        <TableCell className="px-4 sm:px-6 py-4">{userDisplay}</TableCell>
        <TableCell className="px-4 sm:px-6 py-4">{matriculeDisplay}</TableCell>
        <TableCell className="px-4 sm:px-6 py-4">{displayPeriod}</TableCell>
        <TableCell className="px-4 sm:px-6 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
              booking.status
            )}`}
          >
            {booking.status || "N/A"}
          </span>
        </TableCell>
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white shadow-md rounded-md border border-gray-200 z-50"
            >
              <DropdownMenuItem
                onClick={() => setIsDetailsDialogOpen(true)}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                <Eye className="h-4 w-4 text-green-500" />
                <span>Détails</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsStatusDialogOpen(true)}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>Modifier Statut</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Détails Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-yellow-600" />
              Détails de la réservation
            </DialogTitle>
            <DialogDescription>
              Informations sur la réservation sélectionnée
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Utilisateur */}
            <div className="border-b pb-4 flex gap-2">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-yellow-50">
                <UserIcon className="w-7 h-7 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-3 text-yellow-700">Utilisateur</h3>
                {user ? (
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900/90 w-28">Nom:</span>
                      <span>{user.firstName || "N/A"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900/90 w-28">Prénom:</span>
                      <span>{user.lastName || "N/A"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900/90 w-28">Email:</span>
                      <span>{user.userEmail || "N/A"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900/90 w-28">Téléphone:</span>
                      <span>{user.userPhone || "N/A"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-900/90 w-28">Matricule:</span>
                      <span>{user.matricule || "N/A"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">Aucune information utilisateur disponible</p>
                )}
              </div>
            </div>

            {/* Activité */}
            <div className="border-b pb-4 flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                <Home className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg mb-1 text-blue-700">Activité</h3>
                {activity ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="font-medium text-gray-900/90">Nom:</span>
                    <span>{activity.title}</span>
                    <span className="font-medium text-gray-900/90">Catégorie:</span>
                    <span>{activityCategory}</span>
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune information d'activité disponible</p>
                )}
              </div>
            </div>

            {/* Réservation */}
            <div className="border-b pb-4 flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                <ClipboardList className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg mb-1 text-green-700">Réservation</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-gray-900/90">Période:</span>
                  <span>{displayPeriod}</span>
                  <span className="font-medium text-gray-900/90">Statut:</span>
                  <span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status || "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                <CalendarIcon className="w-7 h-7 text-gray-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg mb-1 text-gray-900/90">Dates</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-gray-900/90">Créée le:</span>
                  <span>
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString('fr-FR')
                      : "N/A"}
                  </span>
                  <span className="font-medium text-gray-900/90">Modifiée le:</span>
                  <span>
                    {booking.updatedAt
                      ? new Date(booking.updatedAt).toLocaleDateString('fr-FR')
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Modifier le statut de la réservation
            </DialogTitle>
            <DialogDescription>
              Mettre à jour le statut de cette réservation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Booking Summary */}
            <div className={`p-4 rounded-lg border ${getStatusColor(booking.status)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{activityName}</h3>
                  <p className="text-sm">{userDisplay} • {matriculeDisplay}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                  {booking.status || "Non défini"}
                </span>
              </div>
              <p className="mt-2 text-sm">{displayPeriod}</p>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900/90">
                Nouveau statut
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  console.log("New status selected:", value); // Log the new status
                  setSelectedStatus(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="confirmé">Confirmé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleStatusUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Valider le statut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Supprimer la réservation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réservation ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}