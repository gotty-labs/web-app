import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export const Open = () => (
  <div className="dark bg-background text-foreground flex justify-center p-10">
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">Filters</Button>
      </PopoverTrigger>
      <PopoverContent className="dark">
        <PopoverHeader>
          <PopoverTitle>Filter games</PopoverTitle>
          <PopoverDescription>
            Narrow results by platform and rating.
          </PopoverDescription>
        </PopoverHeader>
        <div className="text-muted-foreground mt-2 text-sm">
          PC · PlayStation · Xbox · Switch
        </div>
      </PopoverContent>
    </Popover>
  </div>
)
