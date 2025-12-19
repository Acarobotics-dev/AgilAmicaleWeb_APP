/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "./types";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Eye, EyeOff, Mail, Phone, User as UserIcon, Lock, Badge } from "lucide-react";
import { TailChase } from "ldrs/react";

// Validation rules
const VALIDATE = {
  firstName: {
    required: "Le prénom est requis",
    minLength: { value: 2, message: "Le prénom doit contenir au moins 2 caractères" },
  },
  lastName: {
    required: "Le nom est requis",
    minLength: { value: 2, message: "Le nom doit contenir au moins 2 caractères" },
  },
  userEmail: {
    required: "L'email est requis",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Email invalide",
    },
  },
  userPhone: {
    required: "Le numéro de téléphone est requis",
    validate: (value: string) =>
      value && value.length >= 8 && value.length <= 20
        ? true
        : "Numéro de téléphone invalide",
  },
  matricule: {
    required: "Le matricule est requis",
    minLength: { value: 4, message: "Le matricule doit contenir 4 chiffres" },
    maxLength: { value: 4, message: "Le matricule doit contenir 4 chiffres" },
    pattern: {
      value: /^\d{4}$/,
      message: "Le matricule doit contenir 4 chiffres",
    },
  },
  password: {
    required: "Le mot de passe est requis",
    minLength: { value: 6, message: "Le mot de passe doit contenir au moins 6 caractères" },
  },
};

type AddEditUserFormProps = {
  onSubmit: (user: {
    firstName: string;
    lastName: string;
    userEmail: string;
    userPhone: string;
    matricule: string;
    password: string;
    status: "En Attente" | "Approuvé" | "Refusé";
    role: "adherent" | "responsable";
  }) => void | Promise<void>;
  initialData?: User | null;
  isSubmitting?: boolean;
};

export function AddEditUserForm({ onSubmit, initialData, isSubmitting = false }: AddEditUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      userEmail: initialData?.userEmail || "",
      userPhone: initialData?.userPhone || "",
      matricule: initialData?.matricule || "",
      password: "",
      status: initialData?.status || "En Attente",
      role: initialData?.role || "adherent",
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  const handleFormSubmit = (values: any) => {
    onSubmit(values);
  };

  const errorClass = (error?: any) =>
    error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <div className="max-w-4xl mx-auto relative">
      {isSubmitting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="flex items-center space-x-3">
            <TailChase size="32" speed="1.75" color="#3b82f6" />
            <span className="text-blue-700 font-semibold text-lg">
              {initialData ? "Mise à jour en cours..." : "Création en cours..."}
            </span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form id="user-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  Informations personnelles
                </h3>
                <p className="text-sm text-gray-500 mt-1">Détails de base de l'utilisateur</p>
              </div>

              {/* First Name */}
              <FormField
                control={control}
                name="firstName"
                rules={VALIDATE.firstName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-firstName"
                      className={`flex items-center font-semibold ${errors.firstName ? "text-red-600" : "text-gray-900"}`}
                    >
                      <UserIcon className="w-4 h-4 mr-2" /> Prénom *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="user-firstName"
                          placeholder="Entrez le prénom"
                          {...field}
                          className={`pl-10 h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 ${errorClass(errors.firstName)}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={control}
                name="lastName"
                rules={VALIDATE.lastName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-lastName"
                      className={`flex items-center font-semibold ${errors.lastName ? "text-red-600" : "text-gray-900"}`}
                    >
                      <UserIcon className="w-4 h-4 mr-2" /> Nom *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="user-lastName"
                          placeholder="Entrez le nom"
                          {...field}
                          className={`pl-10 h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 ${errorClass(errors.lastName)}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={control}
                name="userEmail"
                rules={VALIDATE.userEmail}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-email"
                      className={`flex items-center font-semibold ${errors.userEmail ? "text-red-600" : "text-gray-900"}`}
                    >
                      <Mail className="w-4 h-4 mr-2" /> Email *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="exemple@email.com"
                          {...field}
                          className={`pl-10 h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 ${errorClass(errors.userEmail)}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Informations de compte
                </h3>
                <p className="text-sm text-gray-500 mt-1">Configuration du compte utilisateur</p>
              </div>

              {/* Phone */}
              <FormField
                control={control}
                name="userPhone"
                rules={VALIDATE.userPhone}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-phone"
                      className={`flex items-center font-semibold ${errors.userPhone ? "text-red-600" : "text-gray-900"}`}
                    >
                      <Phone className="w-4 h-4 mr-2" /> Téléphone *
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="tn"
                        value={field.value}
                        onChange={(phone) => setValue("userPhone", phone)}
                        inputClassName={`!w-full !h-12 !bg-white !border-input !rounded-xl focus:!border-blue-500 focus:!ring-blue-500/20 !transition-all !duration-200 !text-gray-900 ${errorClass(errors.userPhone)}`}
                                          />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Matricule */}
              <FormField
                control={control}
                name="matricule"
                rules={VALIDATE.matricule}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-matricule"
                      className={`flex items-center font-semibold ${errors.matricule ? "text-red-600" : "text-gray-900"}`}
                    >
                      <Badge className="w-4 h-4 mr-2" /> Matricule *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="user-matricule"
                          placeholder="0000"
                          {...field}
                          maxLength={4}
                          className={`pl-10 h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 ${errorClass(errors.matricule)}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={control}
                name="password"
                rules={initialData ? {} : VALIDATE.password}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="user-password"
                      className={`flex items-center font-semibold ${errors.password ? "text-red-600" : "text-gray-900"}`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {initialData ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="user-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={initialData ? "Laisser vide pour garder l'ancien" : "Entrez le mot de passe"}
                          {...field}
                          className={`pl-10 pr-12 h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 ${errorClass(errors.password)}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Role and Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="user-role"
                    className="flex items-center font-semibold text-gray-900"
                  >
                    <UserIcon className="w-4 h-4 mr-2" /> Rôle *
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        id="user-role"
                        className="h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      >
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="adherent">Adhérent</SelectItem>
                      <SelectItem value="responsable">Responsable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="user-status"
                    className="flex items-center font-semibold text-gray-900"
                  >
                    <Badge className="w-4 h-4 mr-2" /> Statut *
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        id="user-status"
                        className="h-12 bg-white border-input rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      >
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="En Attente">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          En Attente
                        </div>
                      </SelectItem>
                      <SelectItem value="Approuvé">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Approuvé
                        </div>
                      </SelectItem>
                      <SelectItem value="Refusé">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Refusé
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
