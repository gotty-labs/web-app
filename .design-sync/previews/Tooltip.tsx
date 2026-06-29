import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { HeartIcon } from 'lucide-react'

export const Open = () => (
  <div className="dark bg-background text-foreground flex justify-center p-12">
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Wishlist">
            <HeartIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="dark">Add to wishlist</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)
