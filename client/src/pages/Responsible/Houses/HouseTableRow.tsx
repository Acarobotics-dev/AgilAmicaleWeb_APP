import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteHouseService } from "@/services";
import { toast } from "sonner";
import { House } from "./types";

interface HouseTableRowProps {
  house: House;
  onActionComplete?: () => void;
  onEdit: () => void;
}

export function HouseTableRow({
  house,
  onActionComplete,
  onEdit,
}: HouseTableRowProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDetails = () => {
    navigate(`view/${house._id}`);
  };

  const handleDelete = async () => {
    try {
      await DeleteHouseService(house._id);
      toast.success("Maison supprimée avec succès !");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression de la maison :", err);
      toast.error("Échec de la suppression");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };



  return (
    <>
      <TableRow key={house._id} className="hover:bg-gray-100/50">
        {/* Title */}
        <TableCell className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <p className="font-medium text-gray-900 truncate">{house.title}</p>
          </div>
        </TableCell>

        {/* Address */}
        <TableCell className="px-4 sm:px-6 py-4">
          <p className="text-sm text-gray-900">{house.address}</p>
        </TableCell>

        {/* Description */}
        <TableCell className="px-4 sm:px-6 py-4 max-w-[300px]">
          <div className="space-y-1">
            <div
              className={`text-sm text-gray-500 ${
                isExpanded
                  ? "max-h-full overflow-y-auto whitespace-pre-wrap break-words"
                  : "line-clamp-3"
              }`}
            >
              {house.description || "Aucune description disponible"}
            </div>
            {(house.description || "").length > 60 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-500 hover:underline"
              >
                {isExpanded ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </div>
        </TableCell>

        {/* Location */}
        <TableCell className="px-4 sm:px-6 py-4">
          <p className="text-sm text-gray-900">{house.location}</p>
        </TableCell>

        {/* Availability */}
        <TableCell className="px-4 sm:px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              house.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {house.isAvailable ? "Disponible" : "Indisponible"}
          </span>
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
              className="bg-white shadow-lg rounded-xl border border-gray-200 z-50 p-1"
            >
              <DropdownMenuItem
                onClick={onEdit}
                className="cursor-pointer hover:bg-blue-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Pencil className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Modifier</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleViewDetails}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-0 rounded-2xl shadow-2xl bg-white text-gray-900 border-gray-200 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-red-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  Supprimer la Propriété
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Cette action est irréversible et supprimera définitivement toutes les données associées.
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
                    Vous êtes sur le point de supprimer la propriété <strong>"{house.title}"</strong>.
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="sm:order-1 border-input hover:bg-gray-100 hover:border-gray-200 rounded-xl px-6 py-2.5"
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
