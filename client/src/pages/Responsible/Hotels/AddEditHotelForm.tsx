"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, RotateCw } from "lucide-react"
import LogoUploader from "./LogoUploader"

// Schema
const formSchema = z.object({
  title: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  link: z
    .string()
    .url("Veuillez entrer une URL valide")
    .refine((url) => url.startsWith("http"), "L'URL doit commencer par http:// ou https://"),
  logo: z.any().optional(), // Handled by LogoUploader
})

type HotelFormValues = z.infer<typeof formSchema>

interface AddEditHotelFormProps {
  onSubmit: (values: FormData) => void
  initialData?: {
    title: string
    logo: string
    link: string
  }
}

export function AddEditHotelForm({ onSubmit, initialData }: AddEditHotelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      link: initialData?.link || "",
      logo: null,
    },
  })

  const handleSubmit = async (values: HotelFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("link", values.link)

      if (values.logo) {
        formData.append("logo", values.logo)
        if (initialData?.logo) {
          formData.append("removedImageUrls", JSON.stringify([initialData.logo]))
        }
      } else if (initialData?.logo) {
        formData.append("keepExistingLogo", "true")
      }

      await onSubmit(formData)
    } catch (error) {
      console.error(error)
      toast.error("Une erreur est survenue lors de la préparation des données.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {initialData ? "Modifier l'hôtel" : "Ajouter un hôtel"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les partenariats hôteliers et leurs informations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

          {/* Main Info */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'hôtel</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Hôtel Marriott" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Logo Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Logo</h3>
              <p className="text-xs text-gray-500">Image représentative de l'hôtel.</p>
            </div>

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LogoUploader
                      initialImage={initialData?.logo || null}
                      onImageChange={(file) => field.onChange(file)}
                      className="w-full max-w-sm mx-auto sm:mx-0"
                      aspectRatio="square"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
