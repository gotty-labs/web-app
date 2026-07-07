import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const years = Array.from({ length: 16 }, (_, i) => 2010 + i)

export const InSelect = () => (
  <div className="dark bg-background text-foreground p-6">
    <Select defaultValue="2024" open>
      <SelectTrigger className="dark w-44">
        <SelectValue placeholder="Release year" />
      </SelectTrigger>
      <SelectContent className="dark">
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)
