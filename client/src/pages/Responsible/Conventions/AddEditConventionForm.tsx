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
    <div className="h-[calc(100vh-200px)] relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">
              {initialData ? "Mise à jour en cours..." : "Création en cours..."}
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 p-6 h-full overflow-y-auto pb-32"
        >
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

          {/* Basic Information Section */}
          <FormSection
            icon={FileText}
            title="Informations de base"
            description="Renseignez le titre et la description de la convention"
            variant="blue"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Titre *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Ex: Convention avec Hôtel Marriott"
                        className="pl-10 bg-white border-input focus:border-primary"
                        {...field}
                      />
                    </div>
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
                  <FormLabel className="text-gray-900">Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les termes et conditions de la convention..."
                      rows={6}
                      className="bg-white border-input focus:border-primary resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span className="text-xs text-gray-500">
                      {descriptionValue?.length || 0} caractères
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Image Section */}
          <FormSection
            icon={ImageIcon}
            title="Image de la convention"
            description="Ajoutez une image représentative (JPEG, PNG, WebP)"
            variant="green"
          >
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
                      // Validate file size (max 5MB)
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
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-gray-100/50 transition-all duration-200 bg-white"
                >
                  <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
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
          </FormSection>

          {/* PDF Document Section */}
          <FormSection
            icon={FileDown}
            title="Document PDF"
            description="Téléchargez le document officiel de la convention"
            variant="orange"
          >
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
                      // Validate file size (max 10MB)
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
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-gray-100/50 transition-all duration-200 bg-white"
                >
                  <div className="p-3 bg-orange-500/10 text-orange-600 rounded-full mb-3">
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
          </FormSection>
        </form>
      </Form>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <p className="text-xs text-gray-500 flex-shrink-0">
            * Champs obligatoires
          </p>
          <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCw className="w-4 h-4" />
              Réinitialiser
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {initialData ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? "Mettre à jour" : "Créer la convention"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}