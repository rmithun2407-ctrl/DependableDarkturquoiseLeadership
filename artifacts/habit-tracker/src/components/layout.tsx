import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Today", icon: LayoutDashboard },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/habits", label: "Habits", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background w-full">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative w-full max-w-2xl mx-auto">
        {children}
      </main>

      {/* Bottom Nav Mobile / Side Nav Desktop */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 md:border-l md:border-border bg-card/80 backdrop-blur-lg border-t border-border p-2 pb-safe md:p-6 md:flex md:flex-col md:justify-start z-50">
        <div className="hidden md:block mb-8 px-4">
          <h1 className="font-serif text-3xl text-primary font-bold tracking-tight">Ritual</h1>
        </div>
        
        <ul className="flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href} className="flex-1 md:flex-none">
                <Link href={item.href} className="block w-full">
                  <div
                    className={cn(
                      "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 py-3 md:py-3 md:px-4 rounded-xl transition-all",
                      isActive
                        ? "text-primary md:bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn("text-[10px] md:text-sm font-medium", isActive && "font-bold")}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
