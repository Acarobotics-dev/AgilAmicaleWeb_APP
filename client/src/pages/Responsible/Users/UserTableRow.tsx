import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { User } from "./types"; // Make sure to update this path
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
  Eye,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteUserService, UpdateUserStatusService } from "@/services";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define Props
interface UserTableRowProps {
  user: User;
  onActionComplete?: () => void;
  onEdit: () => void;
}

export function UserTableRow({
  user,
  onActionComplete,
  onEdit,
}: UserTableRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"En Attente" | "Approuvé" | "Refusé">(user.status as "En Attente" | "Approuvé" | "Refusé");

  // Handle Delete Action
  const handleDelete = async () => {
    try {
      await DeleteUserService(user._id!); // Assumes service exists
      toast.success("Utilisateur supprimé avec succès !");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la suppression de l'utilisateur :", err);
      toast.error("Échec de la suppression de l'utilisateur");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async () => {
    try {
      await UpdateUserStatusService(user._id!, { status: selectedStatus });
      toast.success("Statut de l'utilisateur mis à jour avec succès !");
      onActionComplete?.();
    } catch (err) {
      console.error("Échec de la mise à jour du statut :", err);
      toast.error("Échec de la mise à jour du statut");
    } finally {
      setIsStatusDialogOpen(false);
    }
  };

  // Helper for badge color
  function getStatusBadge(status: string) {
    switch (status) {
      case "En Attente":
        return "bg-yellow-100 text-yellow-800";
      case "Approuvé":
        return "bg-green-100 text-green-800";
      case "Refusé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-500";
    }
  }

  // Helper for border color
  function getStatusBorder(status: string) {
    switch (status) {
      case "En Attente":
        return "border-yellow-300";
      case "Approuvé":
        return "border-green-300";
      case "Refusé":
        return "border-red-300";
      default:
        return "border-gray-200";
    }
  }

  return (
    <>
      {/* Table Row */}
      <TableRow key={user._id} className="hover:bg-gray-100/50">
        {/* Full Name */}
        <TableCell className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-medium">
              <AvatarFallback>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">ID: {user._id}</p>
            </div>
          </div>
        </TableCell>

        {/* Email */}
        <TableCell className="px-4 sm:px-6 py-4">
          <p className="text-sm text-gray-900">{user.userEmail}</p>
        </TableCell>

        {/* Phone */}
        <TableCell className="px-4 sm:px-6 py-4">
          <p className="text-sm text-gray-900">{user.userPhone || "-"}</p>
        </TableCell>

        {/* Role */}
        <TableCell className="px-4 sm:px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {user.role === "adherent"
              ? "Adhérent"
              : user.role === "responsable"
              ? "Responsable"
              : "Administrateur"}
          </span>
        </TableCell>

        {/* Status */}
        <TableCell className="px-4 sm:px-6 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.status === "En Attente"
                ? "bg-yellow-100 text-yellow-800"
                : user.status === "Approuvé"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.status}
          </span>
        </TableCell>

        {/* Matricule */}
        <TableCell className="px-4 sm:px-6 py-4">
          <p className="text-sm text-gray-900">{user.matricule}</p>
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
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-red-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-red-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Supprimer</span>
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
                onClick={() => setIsStatusDialogOpen(true)}
                className="cursor-pointer hover:bg-orange-50 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              >
                <div className="p-1 bg-orange-100 rounded-lg">
                  <Info className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Changer Status</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Details Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-screen overflow-y-auto p-6 rounded-xl shadow-2xl bg-white border-gray-200">
          <DialogHeader className="mb-4 border-b border-gray-200 pb-4 flex flex-row items-center gap-2">
            <Eye className="h-6 w-6 text-green-500" />
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Détails de l'utilisateur
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Informations complètes de l'utilisateur sélectionné.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-6">
            <Avatar className="h-14 w-14 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-medium text-xl">
              <AvatarFallback>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role === "adherent"
                  ? "Adhérent"
                  : user.role === "responsable"
                  ? "Responsable"
                  : "Administrateur"}
              </span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-500" /> Email
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {user.userEmail || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-500" /> Téléphone
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {user.userPhone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-500" /> Matricule
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {user.matricule || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-500" /> Statut
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === "En Attente"
                      ? "bg-yellow-100 text-yellow-800"
                      : user.status === "Approuvé"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1">
                <Eye className="h-4 w-4 text-gray-500" /> Informations supplémentaires
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    ID Utilisateur
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Date d'inscription
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-0 rounded-2xl shadow-2xl bg-white text-gray-900 border-gray-200 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-red-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  Supprimer l'Utilisateur
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
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Attention !
                  </h4>
                  <p className="text-sm text-red-700">
                    Vous êtes sur le point de supprimer l'utilisateur <strong>"{user.firstName} {user.lastName}"</strong>.
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

      {/* Status Validation Modal */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md w-full p-6 rounded-lg shadow-lg bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Modifier le statut de l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Mettre à jour le statut de cet utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* User Summary */}
            <div className={`p-4 rounded-lg border ${getStatusBorder(user.status)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-500">{user.userEmail} • {user.matricule}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                  {user.status || "N/A"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Rôle: {user.role === "adherent" ? "Adhérent" : user.role === "responsable" ? "Responsable" : "Administrateur"}
              </p>
            </div>
            {/* Status Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Nouveau statut
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as "En Attente" | "Approuvé" | "Refusé");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En Attente">En attente</SelectItem>
                  <SelectItem value="Approuvé">Approuvé</SelectItem>
                  <SelectItem value="Refusé">Refusé</SelectItem>
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
             className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Valider le statut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}