import { useRef, useCallback, useState } from "react";
import { Camera, ImagePlus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageCaptureProps {
  onImageCaptured: (base64DataUrl: string) => void;
  currentImage: string | null;
  onClear: () => void;
  disabled?: boolean;
  /** Compact variant for tighter layouts */
  compact?: boolean;
}

export default function ImageCapture({
  onImageCaptured,
  currentImage,
  onClear,
  disabled = false,
  compact = false,
}: ImageCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image too large. Please use an image under 10MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onImageCaptured(reader.result as string);
      reader.onerror = () => toast.error("Failed to read image file.");
      reader.readAsDataURL(file);
    },
    [onImageCaptured]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [disabled, processFile]
  );

  // ─── Preview state ──────────────────────────────────────────────
  if (currentImage) {
    return (
      <div className="relative rounded-xl overflow-hidden border bg-muted/20 group">
        <img
          src={currentImage}
          alt="Captured clothing item"
          className={`w-full object-contain bg-black/5 ${compact ? "max-h-48" : "max-h-56 sm:max-h-64"}`}
        />
        {/* Overlay actions on hover / always on mobile */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shadow-md text-xs h-8"
            onClick={onClear}
            disabled={disabled}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Retake
          </Button>
        </div>
      </div>
    );
  }

  // ─── Upload zone ────────────────────────────────────────────────
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`
        relative rounded-xl transition-all
        ${compact ? "p-4" : "p-6 sm:p-8"}
        ${isDragging
          ? "border-2 border-primary bg-primary/5 scale-[1.01]"
          : "border-2 border-dashed border-muted-foreground/20"
        }
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      {/* Separate camera input with capture attr for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center">
          <Camera className="w-7 h-7 text-muted-foreground" />
        </div>

        <div className="text-center">
          <p className={`font-medium ${compact ? "text-sm" : "text-base"}`}>
            Snap or upload a photo
          </p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Drag & drop an image here
          </p>
        </div>

        {/* Two distinct action buttons — stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="default"
            size={compact ? "sm" : "default"}
            className="gap-2 sm:hidden"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <ImagePlus className="w-4 h-4" />
            <span className="sm:hidden">Choose from Gallery</span>
            <span className="hidden sm:inline">Browse Files</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
