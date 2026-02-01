import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { AddEditHouseForm } from "./HouseForm/AddEditHouseForm";
import {
  AddHouseService,
  getAllHousesService,
  UpdateHouseService,
} from "@/services";
import { toast } from "react-toastify";
import { House } from "./types";
import { ArrowLeft, Home as HomeIcon, HousePlus, Edit3 } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

export function AddEditHousePage() {
  const navigate = useNavigate();
  const { houseId } = useParams();
  const isEditMode = Boolean(houseId);
  const [initialData, setInitialData] = useState<House | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch houses to get the specific house for editing
  const { data: housesData = { data: [] }, isLoading: isHousesLoading } =
    useQuery({
      queryKey: ["houses"],
      queryFn: getAllHousesService,
      enabled: isEditMode,
    });

  const houses = useMemo(() => housesData.data || [], [housesData.data]);

  // Set initial data when houses are loaded and we're in edit mode
  useEffect(() => {
    if (isEditMode && houses.length > 0 && houseId) {
      const house = houses.find((h: House) => h._id === houseId);
      if (house) {
        setInitialData(house);
      } else {
        toast.error("Maison non trouvée");
        navigate("/responsable/houses");
      }
    }
  }, [houses, houseId, isEditMode, navigate]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (formData: FormData) => {
      setIsSubmitting(true);
      try {
        console.log("FormData entries:", Array.from(formData.entries()));
        if (isEditMode && initialData?._id) {
          await UpdateHouseService(initialData._id, formData);
          toast.success("Maison mise à jour avec succès!");
        } else {
          await AddHouseService(formData);
          toast.success("Maison ajoutée avec succès!");
        }
        navigate("/responsable/houses");
      } catch (err) {
        console.error("Failed to save house:", err);
        toast.error("Échec de l'enregistrement de la maison");
      } finally {
        setIsSubmitting(false);
      }
    },
    [initialData, isEditMode, navigate]
  );

  // Loading state for edit mode
  if (isEditMode && (isHousesLoading || (houses.length > 0 && !initialData))) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <TailChase size="64" speed="1.75" color="#3b82f6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chargement des données de la maison
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-white to-gray-50/20">
        <AppSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Header Section - Updated with new style */}
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
                            <HousePlus className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {isEditMode
                            ? "Modifier la maison"
                            : "Ajouter une nouvelle maison"}
                        </h1>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>
                            {isEditMode ? "Mode édition" : "Création de maison"}
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
                              ? `Modification de "${initialData?.title}"`
                              : "Remplissez tous les champs requis"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/responsable/houses")}
                    className="bg-gray-100 hover:bg-gray-100 border-gray-200 text-gray-900/90 px-5 py-2.5 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-100/20 to-gray-100/30 px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <HomeIcon className="w-5 h-5 text-blue-600" />
                  Informations de la maison
                </h2>
                <p className="text-gray-500 mt-1">
                  Remplissez tous les champs requis pour{" "}
                  {isEditMode ? "modifier" : "créer"} la maison.
                </p>
              </div>

              <div className="p-8">
                <AddEditHouseForm
                  onSubmit={handleFormSubmit}
                  initialData={initialData ? (initialData as any) : undefined}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
