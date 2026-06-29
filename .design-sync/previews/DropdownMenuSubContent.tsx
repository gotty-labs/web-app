import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Share2Icon } from 'lucide-react'

export const Default = () => (
  <div className="dark bg-background text-foreground flex justify-center p-8">
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Game options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark w-52" align="start">
        <DropdownMenuItem>Play</DropdownMenuItem>
        <DropdownMenuItem>Add to library</DropdownMenuItem>
        <DropdownMenuSub open>
          <DropdownMenuSubTrigger>
            <Share2Icon />
            Share
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="dark">
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Invite friend</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
