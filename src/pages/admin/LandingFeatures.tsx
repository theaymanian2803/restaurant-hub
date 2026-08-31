import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/ImageInput";
import { SectionShell, Field } from "@/components/admin/SectionShell";
import { useSectionEditor } from "@/hooks/useSectionEditor";
import { uid, type FeatureCard } from "@/lib/landingContent";

const LandingFeatures = () => {
  const { value, patch, save, loading, saving } = useSectionEditor("features");

  const update = (id: string, p: Partial<FeatureCard>) =>
    patch({ items: value.items.map((i) => (i.id === id ? { ...i, ...p } : i)) });

  return (
    <SectionShell
      title="Features"
      description="Cards highlighting what makes the restaurant special."
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

      <div className="space-y-4">
        {value.items.map((item) => (
          <div key={item.id} className="border border-border/60 bg-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Feature card</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patch({ items: value.items.filter((i) => i.id !== item.id) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Icon name (lucide)">
                <Input value={item.icon} onChange={(e) => update(item.id, { icon: e.target.value })} placeholder="ChefHat" />
              </Field>
              <Field label="Title">
                <Input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={2} value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} />
            </Field>
            <ImageInput label="Feature image" value={item.image} onChange={(image) => update(item.id, { image })} />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() =>
          patch({ items: [...value.items, { id: uid(), icon: "Sparkles", title: "", description: "", image: "" }] })
        }
      >
        <Plus className="h-4 w-4 mr-2" />Add feature
      </Button>
    </SectionShell>
  );
};

export default LandingFeatures;
