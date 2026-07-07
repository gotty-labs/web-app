import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { RocketIcon } from 'lucide-react'

export const Title = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Alert>
      <RocketIcon />
      <AlertTitle>Your game is ready to play</AlertTitle>
      <AlertDescription>
        Elden Ring finished downloading and is installed in your library.
      </AlertDescription>
    </Alert>
  </div>
)
