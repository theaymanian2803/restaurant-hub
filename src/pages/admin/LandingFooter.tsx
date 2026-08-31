import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionShell, Field } from "@/components/admin/SectionShell";
import { useSectionEditor } from "@/hooks/useSectionEditor";
import { uid } from "@/lib/landingContent";

const LandingFooter = () => {
  const { value, patch, save, loading, saving } = useSectionEditor("footer");

  return (
    <SectionShell
      title="Footer & contact"
      description="Contact details, social links and copyright."
      loading={loading}
      saving={saving}
      onSave={save}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Contact email">
          <Input type="email" value={value.email} onChange={(e) => patch({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={value.phone} onChange={(e) => patch({ phone: e.target.value })} />
        </Field>
      </div>
      <Field label="Address">
        <Input value={value.address} onChange={(e) => patch({ address: e.target.value })} />
      </Field>
      <Field label="Copyright text">
        <Input value={value.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
      </Field>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Social links</p>
        {value.socials.map((s) => (
          <div key={s.id} className="flex gap-2">
            <Input
              className="max-w-[180px]"
              placeholder="Label"
              value={s.label}
              onChange={(e) => patch({ socials: value.socials.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)) })}
            />
            <Input
              placeholder="https://…"
              value={s.url}
              onChange={(e) => patch({ socials: value.socials.map((x) => (x.id === s.id ? { ...x, url: e.target.value } : x)) })}
            />
            <Button variant="ghost" size="icon" onClick={() => patch({ socials: value.socials.filter((x) => x.id !== s.id) })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => patch({ socials: [...value.socials, { id: uid(), label: "", url: "" }] })}>
          <Plus className="h-4 w-4 mr-2" />Add link
        </Button>
      </div>
    </SectionShell>
  );
};

export default LandingFooter;
