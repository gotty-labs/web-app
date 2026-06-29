import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

export const WithButton = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Alert>
      <InfoIcon />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>A new patch improves performance.</AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline">Update</Button>
      </AlertAction>
    </Alert>
  </div>
)
