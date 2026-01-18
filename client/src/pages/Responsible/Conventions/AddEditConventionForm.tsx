import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  ImageIcon,
  FileDown,
  Save,
  RotateCw,
  Upload,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";

// Zod validation schema
const conventionSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  image: z.any().optional(),
  file: z.any().optional(),
});

type ConventionFormValues = z.infer<typeof conventionSchema>;

interface AddEditConventionFormProps {
  onSubmit: (values: FormData) => void;
  initialData?: {
    title: string;
    imagePath: string;
    description: string;
    filePath?: string;
  };
}

// Image Preview Component
function ImagePreview({
  file,
  existingPath,
  onRemove
}: {
  file: File | null;
  existingPath?: string;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (existingPath) {
      setPreview(`${import.meta.env.VITE_API_BASE_URL}/${existingPath}`);
    }
  }, [file, existingPath]);

  if (!preview && !existingPath) return null;

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <img
          src={preview || `${import.meta.env.VITE_API_BASE_URL}/${existingPath}`}
          alt="Convention preview"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {file && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      )}
    </div>
  );
}

// File Preview Component
function FilePreview({
  file,
  existingPath,
  onRemove
}: {
  file: File | null;
  existingPath?: string;
  onRemove: () => void;
}) {
  const fileName = file?.name || existingPath?.split('/').pop() || 'Document';
  const fileSize = file ? (file.size / 1024).toFixed(1) : null;

  if (!file && !existingPath) return null;

  return (
    <div className="relative group">
      <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="p-3 bg-red-500/10 text-red-600 rounded-lg">
          <FileDown className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          {fileSize && (
            <p className="text-xs text-gray-500">{fileSize} KB • PDF</p>
          )}
        </div>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex-shrink-0"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// FormSection Component
function FormSection({
  icon: Icon,
  title,
  description,
  variant = "blue",
  children
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  variant?: "blue" | "green" | "orange";
  children: React.ReactNode;
}) {
  const gradients = {
    blue: "from-blue-50 to-indigo-50",
    green: "from-green-50 to-emerald-50",
    orange: "from-orange-50 to-amber-50",
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
  };

  return (
    <div className={`p-6 rounded-xl bg-gradient-to-r ${gradients[variant]} border border-gray-200`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-white rounded-lg ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function AddEditConventionForm({
  onSubmit,
  initialData,
}: AddEditConventionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const form = useForm<ConventionFormValues>({
    resolver: zodResolver(conventionSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image: null,
      file: null,
    },
  });

  const { formState: { errors } } = form;
  const errorCount = Object.keys(errors).length;
  const descriptionValue = form.watch("description");

  const handleSubmit = async (values: ConventionFormValues) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (pdfFile) {
      formData.append("file", pdfFile);
    }

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setImageFile(null);
    setPdfFile(null);
  };

  return (
    <div className="bg-white p-6 w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Error Summary */}
          {errorCount > 0 && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <span className="font-semibold">{errorCount} erreur{errorCount > 1 ? 's' : ''} détectée{errorCount > 1 ? 's' : ''}</span>
                <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error?.message as string}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information Section (hotel style) */}
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Informations de base
            </h3>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-sm font-medium text-gray-900/90 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Titre *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Convention avec Hôtel Marriott"
                        className="pl-4 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-base"
                        {...field}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900/90 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les termes et conditions de la convention..."
                      rows={6}
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage className="text-red-600" />
                    <span className="text-xs text-gray-500">
                      {descriptionValue?.length || 0} caractères
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Image Section */}
          <div className="border-l-4 border-green-400 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-600" />
              Image de la convention
            </h3>

            {imageFile || initialData?.imagePath ? (
              <ImagePreview
                file={imageFile}
                existingPath={initialData?.imagePath}
                onRemove={() => setImageFile(null)}
              />
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept=".jpeg,.png,.webp,.jpg"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        form.setError("image", { message: "L'image ne doit pas dépasser 5MB" });
                        return;
                      }
                      setImageFile(file);
                      form.clearErrors("image");
                    }
                  }}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-gray-100/50 transition-all duration-200 bg-white"
                >
                  <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Cliquez pour sélectionner une image
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG ou WebP (Max 5MB)
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* PDF Document Section */}
          <div className="border-l-4 border-orange-400 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileDown className="h-5 w-5 text-orange-600" />
              Document PDF
            </h3>

            {pdfFile || initialData?.filePath ? (
              <FilePreview
                file={pdfFile}
                existingPath={initialData?.filePath}
                onRemove={() => setPdfFile(null)}
              />
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        form.setError("file", { message: "Le fichier ne doit pas dépasser 10MB" });
                        return;
                      }
                      setPdfFile(file);
                      form.clearErrors("file");
                    }
                  }}
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-100/50 transition-all duration-200 bg-white"
                >
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-3">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Cliquez pour sélectionner un fichier PDF
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF uniquement (Max 10MB)
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons (hotel style) */}
          <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-row sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 border-gray-300 text-gray-900/90 hover:bg-gray-100"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <RotateCw className="h-5 w-5 mr-2" />
                Réinitialiser
              </Button>

              <Button
                type="submit"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{initialData ? "Mise à jour..." : "Ajout en cours..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>{initialData ? "Mettre à jour la convention" : "Ajouter la convention"}</span>
                  </div>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Les champs marqués d'un astérisque <span className="text-red-600 font-bold">*</span> sont obligatoires
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}