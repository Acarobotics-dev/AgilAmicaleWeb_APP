/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Button } from "@/components/ui/button";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import { useState, useEffect } from "react";
import LogoUploader from "./LogoUploader";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building, Link2, ImageIcon, Save, AlertCircle, RotateCw } from "lucide-react";

// Validation schema with enhanced validation
const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message:
        "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets",
    }),
  link: z
    .string()
    .url({ message: "Veuillez entrer une URL valide" })
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);
          return ["http:", "https:"].includes(parsedUrl.protocol);
        } catch {
          return false;
        }
      },
      { message: "L'URL doit commencer par http:// ou https://" }
    ),
  logo: z
    .any()
});

interface AddEditHotelFormProps {
  onSubmit: (values: FormData) => void;
  initialData?: {
    title: string;
    logo: string;
    link: string;
  };
}

export function AddEditHotelForm({
  onSubmit,
  initialData,
}: AddEditHotelFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);



  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      link: initialData?.link || "",
      logo: null as File | null,
    },
  });



  const isFormValid = form.formState.isValid;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("link", values.link);

      // If a new logo was uploaded, include it and mark the previous logo for removal
      if (values.logo) {
        formData.append("logo", values.logo);
        if (initialData?.logo) {
          // inform backend to remove the previous logo
          formData.append("removedImageUrls", JSON.stringify([initialData.logo]));
        }
      } else if (initialData?.logo) {
        // No new logo: explicitly tell backend to keep the existing logo
        formData.append("keepExistingLogo", "true");
      }

      // DEBUG: show final payload to help troubleshooting (files will appear as File objects)
      // eslint-disable-next-line no-console
      console.log("Hotel formData entries:", Array.from(formData.entries()));

      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  // Add this useEffect to track when the logo upload is complete
  useEffect(() => {
    // If we're in edit mode and have an initial logo, don't disable the button
    if (initialData?.logo) {
      setUploadingImage(false);
    }
  }, [initialData]);

  return (
    <div className="bg-white p-6 w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Informations de base
              </h3>

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="text-sm font-medium text-gray-900/90 flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      Nom de l'hôtel *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Entrez le nom de l'hôtel (ex: Hôtel Marriott)"
                          className="pl-4 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                        />
                        {form.formState.errors.title && (
                          <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Link Field */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900/90 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-gray-500" />
                      Site web de l'hôtel *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="https://www.exemple-hotel.com"

                          className="pl-4 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                        />
                        {form.formState.errors.link && (
                          <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                    <p className="text-xs text-gray-500 mt-1">
                      L'URL doit commencer par http:// ou https://
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Logo Upload Section */}
            <div className="border-l-4 border-green-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-600" />
                Logo de l'hôtel
              </h3>

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-medium text-gray-900/90 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      Logo *
                    </FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <LogoUploader
                          initialImage={initialData?.logo || null}
                          onImageChange={(file) => {
                            field.onChange(file);
                            setUploadingImage(false);
                          }}
                          className="w-full h-60 mx-auto" // Increased height and made it full width
                          aspectRatio="square" // Keeping the square aspect ratio
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                    <p className="text-xs text-gray-500 mt-2">
                      Formats acceptés: JPG, PNG, WEBP (max 2MB). Le logo est
                      obligatoire.
                    </p>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Error Summary */}
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Veuillez corriger les erreurs suivantes :
                  </h4>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {Object.entries(form.formState.errors).map(
                      ([field, error]) => (
                        <li key={field} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {typeof error?.message === "string"
                            ? error.message
                            : "Erreur de validation"}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-row sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 border-gray-300 text-gray-900/90 hover:bg-gray-100"
                onClick={() => form.reset()}
                disabled={submitting}
              >
                <RotateCw className="h-5 w-5 mr-2" />
                Réinitialiser
              </Button>

              <Button
                type="submit"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
                // Fix the disabled condition to only consider submitting state
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <TailChase size={18} color="#fff" />
                    <span>
                      {initialData ? "Mise à jour..." : "Ajout en cours..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>
                      {initialData
                        ? "Mettre à jour l'hôtel"
                        : "Ajouter l'hôtel"}
                    </span>
                  </div>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Les champs marqués d'un astérisque{" "}
              <span className="text-red-600 font-bold">*</span> sont obligatoires
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
