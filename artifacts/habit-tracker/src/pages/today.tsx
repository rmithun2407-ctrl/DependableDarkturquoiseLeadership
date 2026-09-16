import { useEffect, useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";
import { useStore, Habit, DailyEntry } from "@/lib/store";
import { cn, formatMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Circle;
  return <IconComponent className={className} />;
}

export default function Today() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  
  const { habits, getEntry, updateEntry, updateNotes, getDailyScore } = useStore();
  const entry = getEntry(dateStr);
  const score = getDailyScore(dateStr);

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary tracking-widest uppercase">
              {isToday(currentDate) ? "Today" : format(currentDate, "EEEE")}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {format(currentDate, "MMM d")}
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="iconSm" className="text-muted-foreground rounded-full h-8 w-8 mt-1">
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(d) => d && setCurrentDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-card rounded-full p-1 border shadow-sm">
            <Button variant="ghost" size="iconSm" onClick={prevDay} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center justify-center w-12 h-12 relative group cursor-pointer" onClick={() => setCurrentDate(new Date())}>
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="3"
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-foreground">{score}%</span>
            </div>
            <Button variant="ghost" size="iconSm" onClick={nextDay} className="rounded-full" disabled={isToday(currentDate)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-4 flex-1">
        {habits.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No habits configured yet.</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              value={entry.values[habit.id]}
              onChange={(val) => updateEntry(dateStr, habit.id, val)}
            />
          ))
        )}

        <div className="pt-8">
          <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Daily Notes</label>
          <textarea
            value={entry.notes || ''}
            onChange={(e) => updateNotes(dateStr, e.target.value)}
            placeholder="How did today feel?"
            className="w-full h-32 rounded-2xl border border-input bg-card p-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function HabitRow({ habit, value, onChange }: { habit: Habit; value: any; onChange: (v: any) => void }) {
  const isCompleted = habit.type === 'boolean' 
    ? !!value 
    : (typeof value === 'number' && habit.target ? value >= habit.target : false);

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
      isCompleted ? "bg-primary/5 border-primary/20" : "bg-card border shadow-sm"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          isCompleted ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
        )}>
          <DynamicIcon name={habit.icon} className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className={cn(
            "font-semibold text-lg transition-colors",
            isCompleted ? "text-primary" : "text-foreground"
          )}>{habit.name}</span>
          {habit.type !== 'boolean' && habit.target && (
            <span className="text-xs text-muted-foreground font-medium">
              Target: {habit.type === 'duration' ? formatMinutes(habit.target) : `${habit.target}${habit.unit || ''}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {habit.type === 'boolean' && (
          <button
            onClick={() => onChange(!value)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
              value ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" : "bg-transparent border-input text-transparent hover:border-primary/50"
            )}
          >
            <Check className="w-6 h-6" strokeWidth={3} />
          </button>
        )}

        {habit.type === 'numeric' && (
          <NumericControl
            value={typeof value === 'number' ? value : 0}
            target={habit.target}
            unit={habit.unit}
            onChange={onChange}
          />
        )}

        {habit.type === 'duration' && (
          <DurationControl
            value={typeof value === 'number' ? value : 0}
            target={habit.target}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

function NumericControl({ value, target, unit, onChange }: { value: number, target?: number, unit?: string, onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 border">
      <Button variant="ghost" size="iconSm" onClick={() => onChange(Math.max(0, value - 1))} className="h-8 w-8 text-muted-foreground hover:text-foreground">
        -
      </Button>
      <div className="w-12 text-center font-bold text-sm">
        {value}
      </div>
      <Button variant="ghost" size="iconSm" onClick={() => onChange(value + 1)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
        +
      </Button>
    </div>
  );
}

function DurationControl({ value, target, onChange }: { value: number, target?: number, onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 border">
      <Button variant="ghost" size="iconSm" onClick={() => onChange(Math.max(0, value - 15))} className="h-8 w-8 text-muted-foreground hover:text-foreground font-medium text-xs">
        -15
      </Button>
      <div className="w-14 text-center font-bold text-sm whitespace-nowrap">
        {formatMinutes(value)}
      </div>
      <Button variant="ghost" size="iconSm" onClick={() => onChange(value + 15)} className="h-8 w-8 text-muted-foreground hover:text-foreground font-medium text-xs">
        +15
      </Button>
    </div>
  );
}
