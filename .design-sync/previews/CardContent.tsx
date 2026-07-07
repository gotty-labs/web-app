import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Content = () => (
  <div className="dark bg-background text-foreground max-w-sm p-6">
    <Card>
      <CardHeader>
        <CardTitle>Elden Ring</CardTitle>
        <CardDescription>FromSoftware · Action RPG</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        An open-world action RPG set in the Lands Between.
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Play now</Button>
        <Button variant="outline">Wishlist</Button>
      </CardFooter>
    </Card>
  </div>
)
