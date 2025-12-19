import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, ExternalLink, Building, Link } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DeleteHotelService } from "@/services"; // Updated service name
import { Hotel } from "./types";

interface HotelTableRowProps {
  hotel: Hotel;
  onActionComplete?: () => void;
}

export function HotelTableRow({
  hotel,
  onActionComplete,
}: HotelTableRowProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/responsable/agences/edit/${hotel._id}`);
  };

  // Handle Delete Action
  const handleDelete = async () => {
    try {
      await DeleteHotelService(hotel._id); // Updated service name
      toast.success("Agence supprimée avec succès !");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression de l'agence :", err);
      toast.error("Échec de la suppression");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      {/* Table Row */}
      <TableRow key={hotel._id} className="hover:bg-gray-100/50">
        {/* Title */}
        <TableCell className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${hotel.logo}`}
              alt={`Logo de ${hotel.title}`}
              className="w-14 h-14 rounded-full object-cover"
            />
            <span className="font-medium text-gray-900 truncate uppercase">{hotel.title}</span>
          </div>
        </TableCell>

        {/* Link */}
        <TableCell className="px-4 sm:px-6 py-4">
          <a
            href={hotel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2 hover:underline transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Visiter le site
          </a>
        </TableCell>

        {/* Actions */}
        <TableCell className="px-4 sm:px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white shadow-lg rounded-xl border-gray-200 z-50 p-1"
            >
              <DropdownMenuItem
                onClick={handleEdit}
                className="cursor-pointer hover:bg-blue-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Pencil className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDetailsDialogOpen(true)}
                className="cursor-pointer hover:bg-green-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-green-100 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Voir Détails</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-red-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-red-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Details Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-full p-0 rounded-2xl bg-white shadow-2xl border-gray-200 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-8 py-6 border-b border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-1 uppercase">
                  {hotel.title}
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Informations détaillées sur l'hôtel
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Logo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-secondary/20 to-blue-50/30 rounded-xl border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-36 h-36 bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex items-center justify-center">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${hotel.logo}`}
                      alt={`Logo de ${hotel.title}`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150?text=Logo";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Détails de l'hôtel
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Nom</span>
                        <span className="text-lg font-semibold text-gray-900">{hotel.title}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Identifiant</span>
                        <span className="text-sm font-medium text-gray-900">{hotel._id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Website Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  Site web officiel
                </h3>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Lien externe</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{hotel.link}</p>
                    </div>
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium text-sm whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visiter le site
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
                className="border-input hover:bg-gray-100 px-6"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-0 rounded-2xl shadow-2xl bg-white text-gray-900 border-gray-200 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-red-200/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  Supprimer l'Agence
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Cette action est irréversible et supprimera définitivement l'agence.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Attention !
                  </h4>
                  <p className="text-sm text-red-700">
                    Vous êtes sur le point de supprimer l'agence <strong>"{hotel.title}"</strong>.
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="sm:order-1 border-input hover:bg-gray-100 hover:border-input rounded-xl px-6 py-2.5"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="sm:order-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
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