import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchSection, saveSection, landingDefaults, type LandingSections, type SectionKey } from "@/lib/landingContent";

export function useSectionEditor<K extends SectionKey>(key: K) {
  const [value, setValue] = useState<LandingSections[K]>(landingDefaults[key]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSection(key)
      .then(setValue)
      .catch(() => toast.error("Could not load section content"))
      .finally(() => setLoading(false));
  }, [key]);

  const patch = (p: Partial<LandingSections[K]>) => setValue((v) => ({ ...v, ...p }));

  const save = async () => {
    setSaving(true);
    try {
      await saveSection(key, value);
      toast.success("Changes saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return { value, setValue, patch, save, loading, saving };
}
