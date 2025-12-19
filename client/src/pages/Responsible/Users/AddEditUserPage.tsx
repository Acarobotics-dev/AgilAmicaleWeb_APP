import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { AddEditUserForm } from "./AddEditUserForm";
import { AddUserService, getAllUsersService, UpdateUserService } from "@/services";
import { toast } from "sonner";
import { User } from "./types";
import { ArrowLeft, User as UserIcon, UserPlus, Edit3, Save, X } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

export function AddEditUserPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditMode = Boolean(userId);

  const [initialData, setInitialData] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized page title and description
  const { title, description } = useMemo(() => ({
    title: isEditMode ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur",
    description: isEditMode
      ? `Modification des informations de ${initialData?.firstName} ${initialData?.lastName}`
      : "Créez un nouveau compte utilisateur pour la plateforme"
  }), [isEditMode, initialData]);

  // Fetch users to get the specific user for editing
  const { data: { data: users = [] } = {}, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsersService,
    enabled: isEditMode,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Set initial data when users are loaded and we're in edit mode
  useEffect(() => {
    if (isEditMode && users.length > 0 && userId) {
      const user = users.find((u: User) => u._id === userId);
      if (user) {
        setInitialData(user);
      } else {
        toast.error("Utilisateur non trouvé");
        navigate("/responsable/users");
      }
    }
  }, [users, userId, isEditMode, navigate]);

  const handleFormSubmit = useCallback(
    async (user: {
      firstName: string;
      lastName: string;
      userEmail: string;
      userPhone: string;
      matricule: string;
      password: string;
      status: "En Attente" | "Approuvé" | "Refusé";
      role: "adherent" | "responsable";
    }) => {
      setIsSubmitting(true);
      try {
        const typeMessages: Record<string, string> = {
          EMAIL_ALREADY_EXISTS: "Cet email est déjà utilisé.",
          MATRICULE_ALREADY_EXISTS: "Ce matricule est déjà utilisé.",
        };

        if (isEditMode && initialData?._id) {
          const result = await UpdateUserService(initialData._id, user);
          if (result?.success) {
            toast.success("Utilisateur mis à jour avec succès!");
            navigate("/responsable/users");
          } else {
            const msg = result?.message || (result?.type && typeMessages[result.type]) || "Échec de la mise à jour de l'utilisateur.";
            toast.error(msg);
          }
        } else {
          const result = await AddUserService(user);
          if (result?.success) {
            toast.success("Utilisateur ajouté avec succès!");
            navigate("/responsable/users");
          } else {
            const msg = result?.message || (result?.type && typeMessages[result.type]) || "Échec de la création de l'utilisateur.";
            toast.error(msg);
          }
        }
      } catch (err) {
        console.error("Failed to save user:", err);
        toast.error("Échec de l'enregistrement de l'utilisateur");
      } finally {
        setIsSubmitting(false);
      }
    },
    [initialData, isEditMode, navigate]
  );

  // Loading state for edit mode
  if (isEditMode && (isUsersLoading || (users.length > 0 && !initialData))) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="relative mb-6 flex justify-center">
                <TailChase size="64" speed="1.75" color="#3b82f6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chargement des données utilisateur
              </h3>
              <p className="text-gray-500">Veuillez patienter...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <SidebarTrigger className="mt-1" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          {isEditMode ? (
                            <Edit3 className="w-5 h-5 text-white" />
                          ) : (
                            <UserPlus className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {title}
                        </h1>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>
                            {isEditMode ? "Mode édition" : "Création d'utilisateur"}
                          </span>
                        </div>
                        {isEditMode && initialData && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>ID: {initialData._id.slice(-8)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>
                            {isEditMode
                              ? `Modification de "${initialData?.firstName} ${initialData?.lastName}"`
                              : "Remplissez tous les champs requis"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/responsable/users")}
                    className="bg-gray-100 hover:bg-gray-100 border-gray-200 text-gray-900/90 px-5 py-2.5 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Informations utilisateur
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Remplissez tous les champs requis pour{" "}
                  {isEditMode ? "modifier" : "créer"} le compte utilisateur.
                </p>
              </div>

              <div className="p-6 md:p-8">
                <AddEditUserForm
                  onSubmit={handleFormSubmit}
                  initialData={initialData}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs md:text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Les champs marqués d'un astérisque (*) sont obligatoires
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/responsable/users")}
                    className="gap-2"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>

                  <Button
                    form="user-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <TailChase size="16" color="white" />
                        {isEditMode ? "En cours..." : "En cours..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? "Mettre à jour" : "Créer"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}