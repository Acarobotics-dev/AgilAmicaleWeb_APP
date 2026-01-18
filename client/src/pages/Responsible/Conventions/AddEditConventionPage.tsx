import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { AddEditConventionForm } from "./AddEditConventionForm";
import {
  AddConventionService,
  getAllConventions,
  UpdateConventionService,
} from "@/services";
import { toast } from "sonner";
import { Convention } from "./types";
import { ArrowLeft, FileText, Edit3 } from "lucide-react";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";

export default function AddEditConventionPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const isEditMode = Boolean(id && id !== "add");

  const [initialData, setInitialData] = useState<Convention | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: conventionsData = { data: [] }, isLoading: isConventionsLoading } =
    useQuery({
      queryKey: ["conventions"],
      queryFn: getAllConventions,
      enabled: isEditMode,
    });

  const conventions = useMemo(() => conventionsData.data || [], [conventionsData.data]);

  useEffect(() => {
    if (isEditMode && conventions.length > 0 && id) {
      const found = conventions.find((c: Convention) => c._id === id);
      if (found) {
        setInitialData(found);
      } else {
        toast.error("Convention non trouvée");
        navigate("/responsable/conventions");
      }
    }
  }, [conventions, id, isEditMode, navigate]);

  const handleFormSubmit = useCallback(
    async (formData: FormData) => {
      setIsSubmitting(true);
      try {
        if (isEditMode && initialData?._id) {
          await UpdateConventionService(initialData._id, formData);
          toast.success("Convention mise à jour avec succès!");
        } else {
          await AddConventionService(formData);
          toast.success("Convention ajoutée avec succès!");
        }
        navigate("/responsable/conventions", { state: { refresh: true } });
      } catch (err) {
        console.error("Failed to save convention:", err);
        toast.error("Échec de l'enregistrement de la convention");
      } finally {
        setIsSubmitting(false);
      }
    },
    [initialData, isEditMode, navigate]
  );

  if (isEditMode && (isConventionsLoading || (conventions.length > 0 && !initialData))) {
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des données</h3>
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
                            <FileText className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {isEditMode ? "Modifier la convention" : "Ajouter une nouvelle convention"}
                        </h1>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{isEditMode ? "Mode édition" : "Création de convention"}</span>
                        </div>
                        {isEditMode && initialData && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>ID: {initialData._id.slice(-8)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/responsable/conventions")}
                    className="bg-gray-100 hover:bg-gray-100 border-gray-200 text-gray-900/90 px-5 py-2.5 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-100/20 to-gray-100/30 px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Informations de la convention
                </h2>
                <p className="text-gray-500 mt-1">Remplissez tous les champs requis pour {isEditMode ? "modifier" : "créer"} la convention.</p>
              </div>

              <div className="w-full">
                <AddEditConventionForm onSubmit={handleFormSubmit} initialData={initialData || undefined} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
