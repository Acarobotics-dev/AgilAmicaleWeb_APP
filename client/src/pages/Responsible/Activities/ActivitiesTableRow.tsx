import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Event, EventType } from "./ActivityForm/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Calendar, MapPin, Users, Tag, Info, Clock, Home, Bus, Train, Ship, Plane } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteEventService } from "@/services";
import { toast } from "sonner";

interface ActivityTableRowProps {
  event: Event; 
  onActionComplete?: () => void;
}

export function EventTableRow({
  event,
  onActionComplete,
}: ActivityTableRowProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/responsable/events/edit/${event._id}`);
  };

  const handleDelete = async () => {
    try {
      await DeleteEventService(event._id);
      toast.success("Événement supprimé avec succès!");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression de l'événement :", err);
      toast.error("Échec de la suppression de l'événement");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const typeColor = {
    Voyage: "bg-blue-100 text-blue-800",
    Excursion: "bg-green-100 text-green-800",
    Club: "bg-yellow-100 text-yellow-800",
    Activité: "bg-purple-100 text-purple-800",
    "Évènement": "bg-pink-100 text-pink-800",
  } as const;

  const formatDate = (date?: Date | string) => {
    if (!date) return "Non spécifié";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return "Non spécifié";
    return time;
  };

  const renderTransportIcon = (type?: string) => {
    switch (type) {
      case "Avion": return <Plane className="h-4 w-4" />;
      case "Bus": return <Bus className="h-4 w-4" />;
      case "Train": return <Train className="h-4 w-4" />;
      case "Bateau": return <Ship className="h-4 w-4" />;
      default: return null;
    }
  };

  const renderEventDetails = () => {
    switch (event.type) {
      case "Voyage":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Destination</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.destination || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ville de départ</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.departureCity || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-blue-500 mt-0.5 flex items-center justify-center">
                {renderTransportIcon(event.transportType)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transport</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.transportType || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hébergement</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.accommodation || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        );

      case "Excursion":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Durée</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.durationHours} heures
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Point de rencontre</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.meetingPoint || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Heure de rencontre</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatTime(event.meetingTime)}
                </p>
              </div>
            </div>
          </div>
        );

      case "Club":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.adresseclub || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tranche d'âge</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.ageGroup || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Horaire</h3>
              <div className="space-y-2">
                {event.schedule?.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 bg-gray-100 rounded">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {formatDate(schedule.day)}: {schedule.time.startTime} - {schedule.time.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Activité":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatDate(event.activityDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatTime(event.activityTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type de sport</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.sportType || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Durée</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.durationMinutes} minutes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.location || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        );

      case "Évènement":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatDate(event.eventDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {formatTime(event.eventTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Organisateur</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.organizer || "Non spécifié"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                <p className="text-sm text-gray-900/90 mt-1">
                  {event.location || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
     <TableRow key={event._id} className="hover:bg-gray-100/50 transition-colors duration-200">
        {/* Title */}
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate text-base">
                {event.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">ID: {event._id}</p>
            </div>
          </div>
        </TableCell>

        {/* Type */}
        <TableCell className="px-6 py-4">
          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${typeColor[event.type]}`}>
            <Tag className="w-3 h-3 mr-1" />
            {event.type}
          </span>
        </TableCell>

        {/* Destination */}
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500/80" />
            <span className="text-sm text-gray-900 font-medium">
              {event.destination || "Non spécifié"}
            </span>
          </div>
        </TableCell>

        {/* Prix */}
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {event.prix || event.pricing?.basePrice || 0} €
            </span>
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white shadow-lg rounded-xl border border-gray-200 z-50 p-1"
            >
              <DropdownMenuItem
                onClick={handleEdit}
                className="cursor-pointer hover:bg-blue-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Pencil className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900/90">Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-red-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-red-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-900/90">Supprimer</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDetailsDialogOpen(true)}
                className="cursor-pointer hover:bg-green-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-green-100 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900/90">Détails</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Details Dialog Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] p-0 rounded-2xl bg-white shadow-2xl border-0 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-6 border-b border-gray-200/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {event.title}
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${typeColor[event.type]}`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {event.type}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{event.destination || "Destination non spécifiée"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(90vh-200px)] p-8">
            <div className="space-y-8">
              {/* Images Section */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Galerie d'images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.images && event.images.length > 0 ? (
                    event.images.map((image, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/${image}`}
                          alt={`${event.title} ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex h-32 items-center justify-center bg-gradient-to-br from-gray-100/20 to-gray-100/30 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <Eye className="h-8 w-8 text-gray-500/80 mx-auto mb-2" />
                        <span className="text-sm text-gray-500 font-medium">Aucune image disponible</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Informations générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900/90 mb-1">Description</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {event.description || "Aucune description disponible"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900/90 mb-1">Participants</h4>
                        <p className="text-lg font-semibold text-gray-900">
                          {event.currentParticipants || 0} / {event.placesDisponibles || event.maxParticipants || "∞"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Places disponibles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Tarification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Prix de base</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {event.prix || event.pricing?.basePrice || 0} €
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Prix conjoint</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {event.pricing?.cojoinPrice || "N/A"} €
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Prix enfant</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {event.pricing?.childPrice || "N/A"} €
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-Specific Details Section */}
              <div className="border-l-4 border-indigo-400 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Détails spécifiques
                </h3>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-6 border border-indigo-200/50">
                  {renderEventDetails()}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-0 rounded-2xl bg-white shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Supprimer l'événement
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-lg flex-shrink-0">
                  <Info className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Êtes-vous sûr de vouloir supprimer cet événement ?
                  </h4>
                  <p className="text-sm text-red-700">
                    <span className="font-medium">"{event.title}"</span> sera définitivement supprimé et ne pourra pas être récupéré.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-6 py-2 border-gray-300 text-gray-900/90 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
