import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RocketIcon, TriangleAlertIcon, InfoIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex max-w-md flex-col gap-3 p-6">
    {children}
  </div>
)

export const Default = () => (
  <Frame>
    <Alert>
      <RocketIcon />
      <AlertTitle>Your game is ready to play</AlertTitle>
      <AlertDescription>
        Elden Ring finished downloading and is installed in your library.
      </AlertDescription>
    </Alert>
  </Frame>
)

export const Destructive = () => (
  <Frame>
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>Installation failed</AlertTitle>
      <AlertDescription>
        We couldn&apos;t install this title. Check your available disk space and
        try again.
      </AlertDescription>
    </Alert>
  </Frame>
)

export const WithAction = () => (
  <Frame>
    <Alert>
      <InfoIcon />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>
        A new patch (v1.12) improves performance and fixes save corruption.
      </AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline">
          Update
        </Button>
      </AlertAction>
    </Alert>
  </Frame>
)
