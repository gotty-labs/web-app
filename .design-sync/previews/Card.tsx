import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground max-w-sm p-6">{children}</div>
)

export const Basic = () => (
  <Frame>
    <Card>
      <CardHeader>
        <CardTitle>Elden Ring</CardTitle>
        <CardDescription>FromSoftware · Action RPG</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        An open-world action RPG set in the Lands Between, shaped by Hidetaka
        Miyazaki and George R. R. Martin.
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Play now</Button>
        <Button variant="outline">Wishlist</Button>
      </CardFooter>
    </Card>
  </Frame>
)

export const WithAction = () => (
  <Frame>
    <Card>
      <CardHeader>
        <CardTitle>Hades II</CardTitle>
        <CardDescription>Supergiant Games · Roguelike</CardDescription>
        <CardAction>
          <Badge variant="secondary">
            <StarIcon />
            9.4
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Battle beyond the Underworld using dark sorcery to take on the Titan of
        Time in this sequel to the award-winning roguelike.
      </CardContent>
    </Card>
  </Frame>
)

export const Compact = () => (
  <Frame>
    <Card size="sm">
      <CardHeader>
        <CardTitle>Stardew Valley</CardTitle>
        <CardDescription>ConcernedApe · Simulation</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Badge variant="outline">Cozy</Badge>
        <Badge variant="outline">Farming</Badge>
      </CardContent>
    </Card>
  </Frame>
)
