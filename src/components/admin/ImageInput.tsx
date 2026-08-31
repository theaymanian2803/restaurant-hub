import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadLandingImage } from "@/lib/landingContent";

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
};

export function ImageInput({ label = "Image", value, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setUploading(true);
    const t = toast.loading("Uploading image…");
    try {
      const url = await uploadLandingImage(file);
      onChange(url);
      toast.success("Image uploaded", { id: t });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed", { id: t });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</Label>
      <div className="mt-2 flex gap-3 items-start">
        {value ? (
          <div className="relative h-20 w-20 shrink-0 border border-border/60 overflow-hidden">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute top-0 right-0 bg-background/80 p-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            placeholder="Paste an image URL…"
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload image
          </Button>
        </div>
      </div>
    </div>
  );
}
