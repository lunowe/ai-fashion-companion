import { useRef, useCallback } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageCaptureProps {
  onImageCaptured: (base64DataUrl: string) => void;
  currentImage: string | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function ImageCapture({
  onImageCaptured,
  currentImage,
  onClear,
  disabled = false,
}: ImageCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image too large. Please use an image under 10MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onImageCaptured(result);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.");
      };
      reader.readAsDataURL(file);

      // Reset file input so the same file can be re-selected
      e.target.value = "";
    },
    [onImageCaptured]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image too large. Please use an image under 10MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onImageCaptured(result);
      };
      reader.readAsDataURL(file);
    },
    [disabled, onImageCaptured]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  if (currentImage) {
    return (
      <div className="relative rounded-lg overflow-hidden border bg-muted/30">
        <img
          src={currentImage}
          alt="Captured clothing item"
          className="w-full max-h-64 object-contain bg-black/5"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 shadow-md"
          onClick={onClear}
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${
          disabled
            ? "opacity-50 cursor-not-allowed border-muted"
            : "cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Take a photo or upload an image</p>
          <p className="text-xs text-muted-foreground mt-1">
            <Upload className="w-3 h-3 inline mr-1" />
            Click to browse or drag & drop
          </p>
        </div>
      </div>
    </div>
  );
}
