/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getUserByIdService, UpdateUserService } from "@/services";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  matricule: string;
  status: string;
  role: string;
}

const PersonalInfoForm = () => {
  const { auth } = useAuth();
  // No local toast hook needed
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profileInfoID = auth?.user?._id;

  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    userEmail: "",
    userPhone: "",
    matricule: "",
    status: "En attente",
    role: "adherant",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!profileInfoID) return;

      try {
        setIsLoading(true);
        const response = await getUserByIdService(profileInfoID);
        if (response?.data) {
          setFormData({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            userEmail: response.data.userEmail || "",
            userPhone: response.data.userPhone || "",
            matricule: response.data.matricule || "",
            status: response.data.status || "En attente",
            role: response.data.role || "adherant",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Impossible de récupérer les informations de l'utilisateur.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [profileInfoID, toast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Email invalide";
    }

    if (!formData.userPhone.trim()) {
      newErrors.userPhone = "Le téléphone est requis";
    } else if (!/^\+?\d{8,15}$/.test(formData.userPhone)) {
      newErrors.userPhone = "Numéro invalide";
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
    } else if (!/^\d{4}$/.test(formData.matricule)) {
      newErrors.matricule = "Doit contenir 4 chiffres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!profileInfoID) return;

    setIsLoading(true);

    try {
      const response = await UpdateUserService(profileInfoID, formData);
      if (response) {
        toast.success("Vos informations ont été sauvegardées avec succès.");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-3xl mx-auto p-6 rounded-lg shadow-sm space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
        <p className="text-sm text-gray-500">Mettez à jour vos informations de profil.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Votre prénom"
              className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${errors.firstName ? "border-red-500" : ""}`}
            />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Votre nom"
              className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${errors.lastName ? "border-red-500" : ""}`}
            />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userEmail">Email</Label>
          <Input
            id="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
            placeholder="votre.email@exemple.com"
            className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${errors.userEmail ? "border-red-500" : ""}`}
          />
          {errors.userEmail && <p className="text-sm text-red-600">{errors.userEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userPhone">Téléphone</Label>
          <PhoneInput
            defaultCountry="tn"
            value={formData.userPhone}
            onChange={(phone) => setFormData({ ...formData, userPhone: phone })}
            inputClassName={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${errors.userPhone ? "border-red-500" : ""}`}
          />
          {errors.userPhone && <p className="text-sm text-red-600">{errors.userPhone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
              className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${errors.matricule ? "border-red-500" : ""}`}
            />
            {errors.matricule && <p className="text-sm text-red-600">{errors.matricule}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Input id="role" disabled value={formData.role} className="h-12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Input id="status" disabled value={formData.status} className="h-12" />
          </div>
        </div>

        <div className="pt-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;