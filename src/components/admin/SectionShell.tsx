import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionShell({
  title,
  description,
  loading,
  saving,
  onSave,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
