import React, { useCallback, useEffect, useRef, useState } from "react";

export type ImageUploaderProps = {
  initialImages?: string[]; // URLs of existing images
  maxFiles?: number;
  disabled?: boolean;
  // Callback receives detailed info plus a combined array `combined` which contains
  // kept image URLs (string) and newly added File objects. This makes it easy for
  // parents to process either kept images (strings) or new uploads (Files) in one list.
  onChange?: (files: {
    newFiles: File[]; // Files to upload
    keptUrls: string[]; // URLs of existing images to keep
    removedUrls: string[]; // URLs of existing images to delete
    combined: Array<string | File>; // keptUrls followed by newFiles
  combinedPreviewUrls?: string[]; // full preview URLs for kept initials + blob URLs for new files
  newFilePreviewUrls?: string[]; // blob URLs for the newly selected files (same order as newFiles)
  }) => void;
};

export default function ImageUploader({
  initialImages = [],
  maxFiles = 10,
  disabled = false,
  onChange,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  // previews will hold blob URLs for newly selected files
  const [previews, setPreviews] = useState<string[]>([]);
  const [removedInitials, setRemovedInitials] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileObjectUrlsRef = useRef<string[]>([]);


  // Track changes and notify parent
  const lastSignatureRef = useRef<string>("");

  useEffect(() => {
    const kept = initialImages.filter((url) => !removedInitials.includes(url));
    const combinedMixed: Array<string | File> = [...kept, ...files];

    // Build preview URLs: convert kept initials to full base URLs and append file object URLs
    const base = import.meta.env.VITE_API_BASE_URL ?? "";
    const keptFullUrls = kept.map((u) => `${base}/${u}`);
    const fileUrls = fileObjectUrlsRef.current || [];
    const combinedPreviewUrls = [...keptFullUrls, ...fileUrls];

    // Create a lightweight signature to detect real changes. For files use name+size+lastModified
    const filesSig = files
      .map((f) => `${f.name}:${f.size}:${f.lastModified}`)
      .join("|");
    const keptSig = kept.join("|");
    const signature = `${keptSig}::${filesSig}`;

    if (signature === lastSignatureRef.current) return; // no real change, avoid notifying parent
    lastSignatureRef.current = signature;

    const payloadForParent = {
      newFiles: files,
      keptUrls: kept,
      removedUrls: removedInitials,
      combined: combinedMixed,
  combinedPreviewUrls,
  newFilePreviewUrls: fileUrls,
    };

  // Notify parent

    onChange?.(payloadForParent);
  }, [files, initialImages, removedInitials, onChange]);

  // Create and track object URLs for uploaded files (previews) and revoke previous ones
  useEffect(() => {
    // Revoke previous object URLs
    fileObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    // Create new object URLs
    const newUrls = files.map((f) => URL.createObjectURL(f));
    fileObjectUrlsRef.current = newUrls;

    // Update previews to the new blob URLs
    setPreviews((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newUrls)) return newUrls;
      return prev;
    });

    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
      fileObjectUrlsRef.current = [];
    };
  }, [files]);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || disabled) return;
      const list = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;

      setFiles((prev) => {
        const remainingSlots = maxFiles - (prev.length + initialImages.length - removedInitials.length);
        const filesToAdd = list.slice(0, remainingSlots);
        return [...prev, ...filesToAdd];
      });
    },
    [maxFiles, initialImages.length, removedInitials.length, disabled]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeInitial = useCallback((url: string) => {
    setRemovedInitials((prev) => [...prev, url]);
  }, []);

  const restoreInitial = useCallback((url: string) => {
    setRemovedInitials((prev) => prev.filter(u => u !== url));
  }, []);

  // Drag & drop removed — uploader now supports click-to-select only

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files ? Array.from(e.target.files) : [];
  addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-900/90 mb-2">Images</label>

      <div
        className={`relative border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col gap-3 items-center justify-center ${
          disabled ? "opacity-60 pointer-events-none" : "hover:border-gray-300"
        }`}
        aria-disabled={disabled}
      >
        <div className="text-center">
          <p className="text-sm text-gray-500">Cliquez pour sélectionner vos images</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium bg-white"
            disabled={disabled}
          >
            Sélectionnez des fichiers
          </button>
          <p className="mt-1 text-xs text-gray-500/80">
            Maximum {maxFiles} images. Seuls les fichiers images sont acceptés.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Preview grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Kept initial images */}
        {initialImages
          .filter(url => !removedInitials.includes(url))
          .map((src, i) => (
            <div key={`initial-${src}`} className="relative rounded overflow-hidden bg-gray-100 border">
              <img src={`${import.meta.env.VITE_API_BASE_URL}/${src}`} alt={`existing-${i}`} className="w-full h-32 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  aria-label={`Supprimer l'image existante ${i}`}
                  onClick={() => removeInitial(src)}
                  className="p-1 bg-white/80 rounded text-xs hover:bg-white"
                  disabled={disabled}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

        {/* Removed initial images (show with option to restore) */}
        {removedInitials.map((src, i) => (
          <div key={`removed-${src}`} className="relative rounded overflow-hidden bg-gray-100 border opacity-50">
            <img src={`${import.meta.env.VITE_API_BASE_URL}/${src}`} alt={`removed-${i}`} className="w-full h-32 object-cover" />
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                aria-label={`Restaurer l'image ${i}`}
                onClick={() => restoreInitial(src)}
                className="p-1 bg-white/80 rounded text-xs hover:bg-white"
                disabled={disabled}
              >
                Restaurer
              </button>
            </div>
          </div>
        ))}

        {/* Newly uploaded files */}
        {previews
          .filter(src => src.startsWith("blob:"))
          .map((src, i) => (
            <div key={`new-${src}`} className="relative rounded overflow-hidden bg-gray-100 border">
              <img src={src} alt={`new-${i}`} className="w-full h-32 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  aria-label={`Supprimer la nouvelle image ${i}`}
                  onClick={() => removeFile(i)}
                  className="p-1 bg-white/80 rounded text-xs hover:bg-white"
                  disabled={disabled}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="mt-3 text-xs text-gray-500">
        {initialImages.length - removedInitials.length} image(s) existante(s) + {files.length} nouvelle(s) image(s)
      </div>


    </div>
  );
}