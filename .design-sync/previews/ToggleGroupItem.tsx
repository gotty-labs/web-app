import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { LayoutGridIcon, ListIcon } from 'lucide-react'

export const Default = () => (
  <div className="dark bg-background text-foreground p-6">
    <ToggleGroup type="single" defaultValue="grid" variant="outline">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGridIcon />
        Grid
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <ListIcon />
        List
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
)
