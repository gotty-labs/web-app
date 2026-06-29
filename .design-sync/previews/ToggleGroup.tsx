import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { LayoutGridIcon, ListIcon, RowsIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex flex-col items-start gap-4 p-6">
    {children}
  </div>
)

export const Single = () => (
  <Frame>
    <ToggleGroup type="single" defaultValue="grid" variant="outline">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGridIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="rows" aria-label="Rows view">
        <RowsIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <ListIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  </Frame>
)

export const Multiple = () => (
  <Frame>
    <ToggleGroup type="multiple" defaultValue={['action', 'rpg']} variant="outline" spacing={0}>
      <ToggleGroupItem value="action">Action</ToggleGroupItem>
      <ToggleGroupItem value="rpg">RPG</ToggleGroupItem>
      <ToggleGroupItem value="indie">Indie</ToggleGroupItem>
    </ToggleGroup>
  </Frame>
)
