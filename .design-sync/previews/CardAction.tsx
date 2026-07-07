import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from 'lucide-react'

export const InHeader = () => (
  <div className="dark bg-background text-foreground max-w-sm p-6">
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
        Battle beyond the Underworld using dark sorcery.
      </CardContent>
    </Card>
  </div>
)
