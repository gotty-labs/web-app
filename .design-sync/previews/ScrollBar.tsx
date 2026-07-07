import { ScrollArea } from '@/components/ui/scroll-area'

export const Vertical = () => (
  <div className="dark bg-background text-foreground p-6">
    <ScrollArea className="ring-foreground/10 h-44 w-64 rounded-lg ring-1">
      <div className="space-y-2 p-3 text-sm">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="text-muted-foreground">
            Achievement #{i + 1} unlocked
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
)
