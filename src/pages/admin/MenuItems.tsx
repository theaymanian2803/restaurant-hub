import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Category = { id: string; name: string };
type Item = {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; category_id: string | null; is_available: boolean;
};

const empty = { name: "", description: "", price: 0, image_url: "", category_id: "", is_available: true };

const MenuItemsAdmin = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [{ data: i }, { data: c }] = await Promise.all([
      supabase.from("menu_items").select("*").order("name"),
      supabase.from("categories").select("id, name").order("sort_order"),
    ]);
    setItems((i ?? []) as Item[]);
    setCats((c ?? []) as Category[]);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (it: Item) => {
    setEditing(it);
    setForm({
      name: it.name,
      description: it.description ?? "",
      price: Number(it.price),
      image_url: it.image_url ?? "",
      category_id: it.category_id ?? "",
      is_available: it.is_available,
    });
    setOpen(true);
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data, error } = await supabase.functions.invoke("upload-to-r2", { body: fd });
      if (error) throw error;
      if (!data?.url) throw new Error("Upload failed");
      setForm((f) => ({ ...f, image_url: data.url }));
      toast.success("Image uploaded to R2");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      is_available: form.is_available,
    };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Item updated" : "Item created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl">Menu items</h1>
          <p className="text-muted-foreground">Manage dishes available to customers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} menu item</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (€)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Image</Label>
                {form.image_url && <img src={form.image_url} alt="" className="w-full h-40 object-cover border border-border mb-2" />}
                <label className="flex items-center justify-center gap-2 border border-dashed border-border p-4 cursor-pointer hover:border-primary/40 transition-colors text-sm">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{uploading ? "Uploading…" : "Upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <Label>Available</Label>
                <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-primary text-primary-foreground">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/60 divide-y divide-border">
        {items.map((it) => {
          const cat = cats.find((c) => c.id === it.category_id);
          return (
            <div key={it.id} className="flex items-center gap-4 p-4">
              {it.image_url ? (
                <img src={it.image_url} alt="" className="w-14 h-14 object-cover border border-border" />
              ) : (
                <div className="w-14 h-14 bg-muted border border-border" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg">{it.name}</p>
                  {!it.is_available && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{cat?.name ?? "Uncategorized"}</p>
              </div>
              <p className="text-primary font-medium">€{Number(it.price).toFixed(2)}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(it)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No items yet.</p>}
      </div>
    </div>
  );
};
export default MenuItemsAdmin;
