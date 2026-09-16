import { useState } from "react";
import { Plus, GripVertical, Trash2, Edit2 } from "lucide-react";
import { useStore, Habit, HabitType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Circle;
  return <IconComponent className={className} />;
}

const COMMON_ICONS = ["Moon", "BookOpen", "Dribbble", "Dumbbell", "Beef", "Droplets", "Scissors", "Heart", "Smartphone", "Coffee", "Briefcase", "Activity", "Music", "PenTool", "Sun"];

export default function Habits() {
  const { habits, reorderHabits, deleteHabit, addHabit, updateHabit } = useStore();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const moveUp = (index: number) => {
    if (index > 0) reorderHabits(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < habits.length - 1) reorderHabits(index, index + 1);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This won't delete past entries, but it will hide the habit.`)) {
      deleteHabit(id);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Habits</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your daily rituals.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full shadow-lg h-12 w-12">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ritual</DialogTitle>
            </DialogHeader>
            <HabitForm 
              onSave={(h) => { addHabit(h); setIsAddOpen(false); }} 
              onCancel={() => setIsAddOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </header>

      <div className="px-6 space-y-3">
        {habits.map((habit, index) => (
          <div key={habit.id} className="flex items-center gap-3 bg-card p-3 pr-4 rounded-2xl border shadow-sm group">
            <div className="flex flex-col gap-1 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveUp(index)} disabled={index === 0} className="disabled:opacity-20 hover:text-foreground">
                <GripVertical className="w-4 h-4 rotate-90" />
              </button>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <DynamicIcon name={habit.icon} className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{habit.name}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {habit.type} {habit.target ? `• ${habit.target}${habit.unit || ''}` : ''}
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="iconSm" onClick={() => setEditingHabit(habit)}>
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Ritual</DialogTitle>
                </DialogHeader>
                {editingHabit && (
                  <HabitForm 
                    initialData={editingHabit}
                    onSave={(h) => { updateHabit(editingHabit.id, h); setEditingHabit(null); }}
                    onCancel={() => setEditingHabit(null)}
                  />
                )}
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="iconSm" onClick={() => handleDelete(habit.id, habit.name)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {habits.length === 0 && (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-2xl">
            No habits yet. Tap the + to add one.
          </div>
        )}
      </div>
    </div>
  );
}

function HabitForm({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData?: Habit;
  onSave: (h: Omit<Habit, 'id'|'order'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<HabitType>(initialData?.type || "boolean");
  const [target, setTarget] = useState(initialData?.target?.toString() || "");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [icon, setIcon] = useState(initialData?.icon || "Circle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name,
      type,
      icon,
      target: type !== 'boolean' && target ? Number(target) : undefined,
      unit: type !== 'boolean' ? unit : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Run" required />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v: HabitType) => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="boolean">Yes / No (Complete)</SelectItem>
            <SelectItem value="numeric">Number Target (e.g. 8 cups)</SelectItem>
            <SelectItem value="duration">Time Duration (e.g. 30 mins)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type !== 'boolean' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Daily Target {type === 'duration' && '(mins)'}</Label>
            <Input 
              type="number" 
              min="1" 
              value={target} 
              onChange={e => setTarget(e.target.value)} 
              placeholder={type === 'duration' ? "e.g. 60" : "e.g. 8"} 
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input 
              value={type === 'duration' ? 'mins' : unit} 
              onChange={e => setUnit(e.target.value)} 
              placeholder="e.g. cups, pages" 
              disabled={type === 'duration'}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1">
          {COMMON_ICONS.map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${icon === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'}`}
            >
              <DynamicIcon name={i} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Ritual</Button>
      </DialogFooter>
    </form>
  );
}
