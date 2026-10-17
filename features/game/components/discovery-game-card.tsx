import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

import { AppImage } from '@/components/app-image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import type { GameDto } from '@/lib/domain/models'
import type { Dictionary, Locale } from '@/lib/i18n'

import { getGameCover } from '../config/images'
import { gameGenreLabel } from '../utils/labels'
import { gamePath } from '../utils/paths'

export function DiscoveryGameCard({
  game,
  slug,
  copy,
  dict,
  locale,
}: {
  game: GameDto
  slug: string
  copy: Dictionary['app']['discovery']['games'][keyof Dictionary['app']['discovery']['games']]
  dict: Dictionary
  locale: Locale
}) {
  const t = dict.app.discovery
  const href = gamePath(game.slug ?? slug, locale)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-5">
          <Link
            href={href}
            prefetch={false}
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <AppImage
              src={getGameCover(game.media?.cover)}
              alt={game.name}
              width={96}
              height={128}
              sizes="96px"
              className="object-cover"
              wrapperClassName="h-32 w-24 rounded-lg"
            />
          </Link>
          <div className="flex min-w-0 flex-col gap-2">
            <CardTitle>
              <h3>
                <Link href={href} prefetch={false} className="hover:underline">
                  {game.name}
                </Link>
              </h3>
            </CardTitle>
            <CardDescription>
              {game.genres
                .slice(0, 2)
                .map((genre) => gameGenreLabel(dict, genre))
                .join(' · ')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium">{t.whyPick}</h4>
          <p className="leading-relaxed text-muted-foreground">{copy.reason}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-medium">{t.consider}</h4>
          <p className="leading-relaxed text-muted-foreground">{copy.consideration}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={href} prefetch={false}>
            {t.viewGame}
            <span className="sr-only">: {game.name}</span>
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
