import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

const games = ['Elden Ring', 'Hades II', 'Celeste', 'Hollow Knight', 'Cuphead']

export const Default = () => (
  <div className="dark bg-background text-foreground flex justify-center p-12">
    <Carousel className="w-full max-w-sm" opts={{ align: 'start' }}>
      <CarouselContent>
        {games.map((g) => (
          <CarouselItem key={g} className="basis-1/2">
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-4 text-center text-sm font-medium">
                {g}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
)
