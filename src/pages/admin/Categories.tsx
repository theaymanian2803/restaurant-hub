import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Category = { id: string; name: string; sort_order: number };

const Categories = () => {
  const [list, setList] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setList((data ?? []) as Category[]);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setName(""); setSortOrder(list.length); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setSortOrder(c.sort_order); setOpen(true); };

  const save = async () => {
    if (!name.trim()) return toast.error("Name required");
    if (editing) {
      const { error } = await supabase.from("categories").update({ name: name.trim(), sort_order: sortOrder }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("categories").insert({ name: name.trim(), sort_order: sortOrder });
      if (error) return toast.error(error.message);
      toast.success("Category created");
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl">Categories</h1>
          <p className="text-muted-foreground">Organize menu sections.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} /></div>
              <div><Label>Sort order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-primary text-primary-foreground">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/60 divide-y divide-border">
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-display text-lg">{c.name}</p>
              <p className="text-xs text-muted-foreground">Order {c.sort_order}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No categories yet.</p>}
      </div>
    </div>
  );
};
export default Categories;
