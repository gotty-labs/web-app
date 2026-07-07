import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-muted-foreground pt-2">
        An open-world action RPG set in the Lands Between. 120+ hours of content.
      </TabsContent>
      <TabsContent value="reviews" className="text-muted-foreground pt-2">
        4.8 / 5 from 12,400 players.
      </TabsContent>
      <TabsContent value="achievements" className="text-muted-foreground pt-2">
        42 achievements · 18 unlocked.
      </TabsContent>
    </Tabs>
  </div>
)
