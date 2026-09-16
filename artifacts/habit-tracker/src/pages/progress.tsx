import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { useStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Circle;
  return <IconComponent className={className} />;
}

export default function Progress() {
  const { habits, getDailyScore, getHabitStreak } = useStore();

  const weeklyData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      data.push({
        date: format(d, "EEE"), // Mon, Tue
        fullDate: dateStr,
        score: getDailyScore(dateStr),
      });
    }
    return data;
  }, [getDailyScore]);

  const monthlyData = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = today; // up to today
    const days = eachDayOfInterval({ start, end });
    
    return days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      return {
        date: format(d, "d"),
        fullDate: dateStr,
        score: getDailyScore(dateStr),
      };
    });
  }, [getDailyScore]);

  const avgWeekly = Math.round(weeklyData.reduce((acc, curr) => acc + curr.score, 0) / (weeklyData.length || 1));

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <h2 className="text-3xl font-serif font-bold text-foreground">Progress</h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Your consistency over time.</p>
      </header>

      <div className="px-6 space-y-8">
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4 pt-4">
            <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Consistency Score</CardTitle>
                <p className="text-4xl font-bold text-primary">{avgWeekly}% <span className="text-sm text-muted-foreground font-normal">avg this week</span></p>
              </CardHeader>
              <CardContent className="h-48 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [`${value}%`, 'Score']}
                    />
                    <Bar dataKey="score" radius={[6, 6, 6, 6]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'hsl(var(--primary))' : entry.score > 40 ? 'hsl(var(--primary)/0.6)' : 'hsl(var(--primary)/0.3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 pt-4">
            <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-48 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      interval="preserveStartEnd"
                      dy={10}
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div>
          <h3 className="font-serif text-xl font-bold mb-4">Current Streaks</h3>
          <div className="grid grid-cols-2 gap-4">
            {habits.map((habit) => {
              const streak = getHabitStreak(habit.id);
              if (streak === 0) return null;
              
              return (
                <div key={habit.id} className="bg-card border rounded-2xl p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full transition-transform group-hover:scale-150" />
                  <div className="flex items-center gap-2 relative z-10">
                    <DynamicIcon name={habit.icon} className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-sm truncate">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 relative z-10">
                    <Flame className="w-5 h-5 text-primary fill-primary" />
                    <span className="text-2xl font-bold text-foreground">{streak}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Days</span>
                  </div>
                </div>
              );
            })}
            
            {habits.every(h => getHabitStreak(h.id) === 0) && (
              <div className="col-span-2 py-8 text-center text-muted-foreground border border-dashed rounded-2xl">
                Start completing habits to build streaks!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
