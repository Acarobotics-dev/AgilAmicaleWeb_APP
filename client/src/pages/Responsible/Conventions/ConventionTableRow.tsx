/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableCell, TableRow } from "@/components/ui/table";
import { Convention } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, FileDown, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { DeleteConventionService, DownloadConventionService } from "@/services";
import { toast } from "sonner";

interface ConventionTableRowProps {
  convention: Convention;
  onActionComplete?: () => void;
  onEdit: () => void;
}

export function ConventionTableRow({
  convention,
  onActionComplete,
  onEdit,
}: ConventionTableRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteConventionService(convention._id);
      toast.success("Convention supprimée avec succès!");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression de la convention :", err);
      toast.error("Échec de la suppression de la convention");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownload = async () => {
    if (!convention.filePath) {
      toast.error("Aucun fichier disponible pour cette convention.");
      return;
    }
    try {
      await DownloadConventionService(
        convention.filePath,
        convention.title.replace(/\s+/g, "_") + ".pdf"
      );
      toast.success("Téléchargement lancé !");
    } catch (error) {
      console.error("Erreur téléchargement :", error);
      toast.error("Échec du téléchargement de la convention.");
    }
  };

  // edit flow moved to dedicated page via parent's onEdit

  return (
    <>
      <TableRow key={convention._id} className="hover:bg-gray-100">
        <TableCell className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {convention.title}
              </p>
              <p className="text-sm text-gray-500">ID: {convention._id}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="px-4 sm:px-6 py-4">
          <div className="relative w-24 overflow-hidden rounded-lg">
            {convention.imagePath ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/${convention.imagePath}`}
                alt={convention.title}
                className="h-full w-full object-cover transition-opacity hover:opacity-90"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-xs text-gray-500">No image</span>
              </div>
            )}
          </div>
        </TableCell>

        <TableCell className="px-4 sm:px-6 py-4 max-w-[300px]">
          <div className="space-y-1">
            <div
              className={`text-sm text-gray-500 ${
                isExpanded
                  ? "max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words"
                  : "line-clamp-3"
              }`}
            >
              {convention.description || "Aucune description disponible"}
            </div>
            {(convention.description || "").length > 60 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-500 hover:underline"
              >
                {isExpanded ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </div>
        </TableCell>

        <TableCell className="px-4 sm:px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleDownload}
            className="cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Télécharger Convention</span>
          </Button>
        </TableCell>

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
              className="bg-white shadow-md rounded-md border border-gray-200 z-50"
            >
              <DropdownMenuItem
                onClick={onEdit}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Modifier</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => !isDeleting && setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                    <span className="text-sm">Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Supprimer</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsDetailsDialogOpen(true)}
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-4 py-2"
              >
                <Eye className="h-4 w-4 text-green-500" />
                <span className="text-sm">Afficher Détails</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full max-h-screen p-6 rounded-lg shadow-lg bg-white text-gray-900">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">
              {convention.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Informations détaillées sur la convention
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[75vh] pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID</h3>
                <p className="text-sm text-gray-900/90">{convention._id}</p>
              </div>

              <div className="flex justify-center">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/${convention.imagePath}`}
                  alt={convention.title}
                  className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                />
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-800 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap break-words">
                  {convention.description || "Aucune description disponible"}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit moved to dedicated page */}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold">
              Supprimer la Convention
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Êtes-vous sûr de vouloir supprimer cette convention ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 text-white animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
