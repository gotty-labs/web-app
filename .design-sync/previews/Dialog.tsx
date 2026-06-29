import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const Open = () => (
  <div className="dark bg-background text-foreground">
    <Dialog open>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Remove from library?</DialogTitle>
          <DialogDescription>
            This removes Elden Ring from your library. You can re-add it any time
            from the store.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)
