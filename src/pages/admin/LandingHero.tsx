import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageInput } from "@/components/admin/ImageInput";
import { SectionShell, Field } from "@/components/admin/SectionShell";
import { useSectionEditor } from "@/hooks/useSectionEditor";

const LandingHero = () => {
  const { value, patch, save, loading, saving } = useSectionEditor("hero");

  return (
    <SectionShell title="Hero" description="The first thing guests see." loading={loading} saving={saving} onSave={save}>
      <Field label="Eyebrow">
        <Input value={value.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
      </Field>
      <Field label="Headline">
        <Input value={value.headline} onChange={(e) => patch({ headline: e.target.value })} />
      </Field>
      <Field label="Subheadline">
        <Textarea rows={3} value={value.subheadline} onChange={(e) => patch({ subheadline: e.target.value })} />
      </Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="CTA button text">
          <Input value={value.ctaText} onChange={(e) => patch({ ctaText: e.target.value })} />
        </Field>
        <Field label="CTA URL">
          <Input value={value.ctaUrl} onChange={(e) => patch({ ctaUrl: e.target.value })} />
        </Field>
      </div>
      <ImageInput label="Banner image" value={value.image} onChange={(image) => patch({ image })} />
    </SectionShell>
  );
};

export default LandingHero;
