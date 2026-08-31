import { useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionShell, Field } from "@/components/admin/SectionShell";
import { useSectionEditor } from "@/hooks/useSectionEditor";
import { deleteLandingImage, uid, uploadLandingImage } from "@/lib/landingContent";
import { cn } from "@/lib/utils";

const LandingGallery = () => {
  const { value, patch, save, loading, saving } = useSectionEditor("gallery");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const uploadFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    const t = toast.loading(`Uploading ${list.length} image${list.length > 1 ? "s" : ""}…`);
    const uploaded: { id: string; url: string; alt: string }[] = [];
    for (const file of list) {
      try {
        uploaded.push({ id: uid(), url: await uploadLandingImage(file), alt: "" });
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }
    patch({ images: [...value.images, ...uploaded] });
    toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`, { id: t });
    setUploading(false);
  };

  const removeImage = async (id: string, url: string) => {
    patch({ images: value.images.filter((i) => i.id !== id) });
    await deleteLandingImage(url);
    toast.success("Image removed");
  };

  return (
    <SectionShell
      title="Gallery"
      description="Drag and drop photos of the room and the plates."
      loading={loading}
      saving={saving}
      onSave={save}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Eyebrow">
          <Input value={value.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Heading">
          <Input value={value.heading} onChange={(e) => patch({ heading: e.target.value })} />
        </Field>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border border-dashed p-10 text-center cursor-pointer transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
        ) : (
          <Upload className="h-6 w-6 mx-auto text-primary" />
        )}
        <p className="mt-3 text-sm text-muted-foreground">Drop images here, or click to choose files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={urlDraft}
          placeholder="…or paste an image URL"
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <Button
          variant="outline"
          onClick={() => {
            if (!urlDraft.trim()) return;
            patch({ images: [...value.images, { id: uid(), url: urlDraft.trim(), alt: "" }] });
            setUrlDraft("");
            toast.success("Image added");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />Add
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.images.map((img) => (
          <div key={img.id} className="space-y-2">
            <div className="relative aspect-square border border-border/60 overflow-hidden group">
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(img.id, img.url)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Input
              value={img.alt}
              placeholder="Alt text"
              onChange={(e) =>
                patch({ images: value.images.map((i) => (i.id === img.id ? { ...i, alt: e.target.value } : i)) })
              }
            />
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

export default LandingGallery;
