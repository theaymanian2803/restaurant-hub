import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/ImageInput";
import { SectionShell, Field } from "@/components/admin/SectionShell";
import { useSectionEditor } from "@/hooks/useSectionEditor";
import { uid, type Testimonial } from "@/lib/landingContent";

const LandingTestimonials = () => {
  const { value, patch, save, loading, saving } = useSectionEditor("testimonials");

  const update = (id: string, p: Partial<Testimonial>) =>
    patch({ items: value.items.map((i) => (i.id === id ? { ...i, ...p } : i)) });

  return (
    <SectionShell
      title="Testimonials"
      description="Words from guests."
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
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Review</p>
              <Button variant="ghost" size="sm" onClick={() => patch({ items: value.items.filter((i) => i.id !== item.id) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} />
              </Field>
              <Field label="Role">
                <Input value={item.role} onChange={(e) => update(item.id, { role: e.target.value })} />
              </Field>
            </div>
            <Field label="Review text">
              <Textarea rows={3} value={item.quote} onChange={(e) => update(item.id, { quote: e.target.value })} />
            </Field>
            <ImageInput label="Avatar" value={item.avatar} onChange={(avatar) => update(item.id, { avatar })} />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => patch({ items: [...value.items, { id: uid(), name: "", role: "", quote: "", avatar: "" }] })}
      >
        <Plus className="h-4 w-4 mr-2" />Add testimonial
      </Button>
    </SectionShell>
  );
};

export default LandingTestimonials;
