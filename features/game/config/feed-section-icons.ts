/**
 * Glyph that identifies each feed section on its hero callout — the closest lucide
 * icon to the Material Symbol the apps use (noted per entry).
 */
import {
  BadgeAlertIcon,
  CalendarDaysIcon,
  ClockIcon,
  CompassIcon,
  CrownIcon,
  Gamepad2Icon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  type LucideIcon,
} from 'lucide-react'

import type { GameSection } from '@/lib/domain/enums'

const FEED_SECTION_ICONS: Record<GameSection, LucideIcon> = {
  UPCOMING_RELEASES: CalendarDaysIcon, // calendar_month
  QUICK_TIME: ClockIcon, // schedule
  TRENDING: TrendingUpIcon, // trending_up
  LAST_VIEWED: CompassIcon, // explore
  FAMILY: HeartIcon, // favorite
  RATING: StarIcon, // star
  CLASSIC: CrownIcon, // crown
  RECENTLY_ADDED: BadgeAlertIcon, // new_releases
  SEASON: SparklesIcon, // auto_awesome
}

/** Falls back to a gamepad (`sports_esports`) for a section this build doesn't know. */
export function feedSectionIcon(section: GameSection): LucideIcon {
  return FEED_SECTION_ICONS[section] ?? Gamepad2Icon
}
