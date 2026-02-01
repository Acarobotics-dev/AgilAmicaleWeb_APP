"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "react-toastify"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  X,
  Upload,
  FileText,
  ImageIcon,
  Paperclip
} from "lucide-react"

// Schema
const conventionSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().min(10, "La description doit être plus détaillée"),
  // Files are handled manually for now due to file input complexity
  image: z.any().optional(),
  file: z.any().optional(),
})

type ConventionFormValues = z.infer<typeof conventionSchema>

interface AddEditConventionFormProps {
  onSubmit: (values: FormData) => void
  initialData?: {
    title: string
    imagePath: string
    description: string
    filePath?: string
  }
}

export function AddEditConventionForm({
  onSubmit,
  initialData,
}: AddEditConventionFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<ConventionFormValues>({
    resolver: zodResolver(conventionSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  })

  // Initialize preview if editing
  useEffect(() => {
    if (initialData?.imagePath) {
      setPreviewUrl(`${import.meta.env.VITE_API_BASE_URL}/${initialData.imagePath}`)
    }
  }, [initialData])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Handle PDF selection
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
    }
  }

  const handleSubmit = async (values: ConventionFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description)

      if (imageFile) formData.append("image", imageFile)
      if (pdfFile) formData.append("file", pdfFile)

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
          {initialData ? "Modifier la convention" : "Nouvelle convention"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Remplissez les informations ci-dessous pour publier une convention.
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
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Convention Hôtel Marriott" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails de l'offre et conditions..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Image de couverture</h3>
              <p className="text-xs text-gray-500">Formats acceptés: JPG, PNG. Max 5MB.</p>
            </div>

            <div className="flex items-start gap-6">
              {previewUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-gray-200 w-full max-w-sm">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        setImageFile(null)
                        setPreviewUrl(null)
                      }}
                    >
                      <X className="w-3 h-3 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Cliquez pour ajouter une image</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <Separator />

          {/* PDF Attachment */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Document attaché (PDF)</h3>
              <p className="text-xs text-gray-500">Pour les détails complets du contrat ou de l'offre.</p>
            </div>

            <div className="flex items-center gap-4">
              {(pdfFile || initialData?.filePath) ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm w-full max-w-sm">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="truncate flex-1">
                    {pdfFile?.name || initialData?.filePath?.split('/').pop()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setPdfFile(null)} // Note: Removing existing file logic might need more handling if strictly required to delete on backend, but for UI form reset this works
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Sélectionner un fichier</span>
                  <input type="file" className="hidden" accept=".pdf" onChange={handlePdfChange} />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}