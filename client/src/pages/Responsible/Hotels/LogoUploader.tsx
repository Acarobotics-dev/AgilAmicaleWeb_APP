import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  initialImage?: string | null;
  onImageChange: (file: File | null) => void;
  className?: string;
  aspectRatio?: "square" | "video";
};

const LogoUploader: React.FC<ImageUploaderProps> = ({
  initialImage = null,
  onImageChange,
  className,
  aspectRatio = "square",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Initialize preview
  useEffect(() => {
    if (!initialImage) return;
    setPreviewUrl(
      typeof initialImage === "string"
        ? `${import.meta.env.VITE_API_BASE_URL}/${initialImage}`
        : URL.createObjectURL(initialImage)
    );
  }, [initialImage]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (previewUrl && typeof initialImage !== "string") {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImage]);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        onImageChange(null);
        setPreviewUrl(null);
        return;
      }

      // Validate file type
      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit");
        return;
      }

      onImageChange(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [onImageChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
    e.target.value = ""; // Reset input to allow re-uploads
  };

  const handleRemove = () => {
    handleFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items?.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files?.length) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Container classes based on state
  const containerClasses = cn(
    "relative flex flex-col items-center justify-center",
    "border-2 border-dashed rounded-lg transition-all",
    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
    aspectRatio === "square" ? "w-32 h-32" : "w-48 h-27",
    className
  );

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center",
            "border-2 rounded-xl p-2 transition-all duration-300",
            "bg-white shadow-sm hover:shadow-md",
            "border-blue-200",
            aspectRatio === "square" ? "w-40 h-40" : "w-56 h-32",
            className
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/20 to-gray-100/30 rounded-lg opacity-50"></div>
          <div className="relative w-full h-full p-3 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Logo preview"
              className="object-contain max-w-full max-h-full rounded-md"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-3 -right-3 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-red-200 transition-all duration-200 hover:scale-105"
            aria-label="Supprimer le logo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center cursor-pointer",
            "border-2 border-dashed rounded-xl transition-all duration-300",
            isDragging
              ? "border-blue-500 bg-blue-50/70 scale-105 shadow-md"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30",
            aspectRatio === "square" ? "w-40 h-40" : "w-56 h-32",
            className
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center p-5 text-center">
            <div
              className={cn(
                "w-12 h-12 mb-3 rounded-full flex items-center justify-center",
                "bg-blue-100 text-blue-600 transition-transform duration-300",
                isDragging ? "scale-110" : ""
              )}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900/90">
              {isDragging ? "Déposez votre logo ici" : "Télécharger un logo"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Cliquez pour parcourir ou glissez-déposez
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                PNG
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                JPG
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                WEBP
              </span>
              <span className="text-xs text-gray-500 ml-1">max 2MB</span>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        hidden
        ref={fileInputRef}
        onChange={handleInputChange}
        aria-label="Télécharger un logo"
      />
    </div>
  );
};

export default LogoUploader;