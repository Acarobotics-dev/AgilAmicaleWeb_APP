import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirecting after deletion
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2 } from "lucide-react";
import { updatePasswordService, DeleteUserService } from "@/services";
import { AuthContext } from "@/context/auth-context";

const DeleteAccountSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { auth ,resetCredentials } = useContext(AuthContext);
  const userId = auth.user?._id;

  const handleDeleteAccount = async () => {
    if (confirmationText !== "SUPPRIMER") {
      toast({
        title: "Erreur",
        description: "Veuillez taper 'SUPPRIMER' pour confirmer la suppression.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'identifiant utilisateur.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      await DeleteUserService(userId); // Call to backend service

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });

      // Clear auth context and redirect
     resetCredentials();
     sessionStorage.clear()
      navigate("/"); // Redirect to homepage or login
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setConfirmationText(""); // Reset input
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'identifiant utilisateur.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await updatePasswordService(currentPassword, newPassword, userId);

      if (response?.success) {
        toast({
          title: "Succès",
          description: "Mot de passe mis à jour avec succès.",
        });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        throw new Error("Échec de la mise à jour du mot de passe");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Changer le mot de passe</CardTitle>
          <CardDescription className="text-orange-600">
            Modifiez votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Votre mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Votre nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isUpdatingPassword}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isUpdatingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le compte
          </CardTitle>
          <CardDescription className="text-red-600">
            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) setConfirmationText(""); // Reset input
              setIsOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmer la suppression
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Cette action est irréversible. Toutes vos données, commandes et factures seront
                  définitivement supprimées.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Pour confirmer, tapez <strong>"SUPPRIMER"</strong> ci-dessous :
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="SUPPRIMER"
                    className="border-red-300 focus:border-red-500"
                  />
                </div>
                <div className="bg-red-100 p-3 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Attention :</strong> Cette action supprimera :
                  </p>
                  <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                    <li>Votre profil utilisateur</li>
                    <li>Vos préférences et paramètres</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
             
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmationText !== "SUPPRIMER"}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAccountSection;