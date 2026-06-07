import { Sparkles } from "lucide-react";

export default function JournalPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Journal
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your Journal and track your progress.
          </p>
        </div>
      </header>

      {/* Premium Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Main Content Area</p>
        </div>
        <div className="col-span-1 glass-panel p-8 rounded-3xl border border-white/5 h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Widgets / Stats</p>
        </div>
      </div>
    </div>
  );
}
