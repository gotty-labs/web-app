import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select'

export const Default = () => (
  <div className="dark bg-background text-foreground p-6">
    <Select defaultValue="action" open>
      <SelectTrigger className="dark w-52">
        <SelectValue placeholder="Select a genre" />
      </SelectTrigger>
      <SelectContent className="dark">
        <SelectGroup>
          <SelectLabel>Genres</SelectLabel>
          <SelectItem value="action">Action</SelectItem>
          <SelectItem value="rpg">Role-playing</SelectItem>
          <SelectItem value="strategy">Strategy</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="indie">Indie</SelectItem>
          <SelectItem value="sim">Simulation</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
