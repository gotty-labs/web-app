import type { GameLibraryProgressState } from '@/lib/domain/enums'

export const progressStateBadgeClass: Record<GameLibraryProgressState, string> = {
  NOT_STARTED: 'bg-progress-not-started text-progress-not-started-foreground',
  IN_PROGRESS: 'bg-progress-in-progress text-progress-in-progress-foreground',
  BLOCKED: 'bg-progress-blocked text-progress-blocked-foreground',
  COMPLETED: 'bg-progress-completed text-progress-completed-foreground',
}

export const progressStateToggleClass: Record<GameLibraryProgressState, string> = {
  NOT_STARTED:
    'border-progress-not-started/60 text-progress-not-started hover:bg-progress-not-started/10 data-[state=on]:border-progress-not-started data-[state=on]:bg-progress-not-started data-[state=on]:text-progress-not-started-foreground',
  IN_PROGRESS:
    'border-progress-in-progress/60 text-progress-in-progress hover:bg-progress-in-progress/10 data-[state=on]:border-progress-in-progress data-[state=on]:bg-progress-in-progress data-[state=on]:text-progress-in-progress-foreground',
  BLOCKED:
    'border-progress-blocked/60 text-progress-blocked hover:bg-progress-blocked/10 data-[state=on]:border-progress-blocked data-[state=on]:bg-progress-blocked data-[state=on]:text-progress-blocked-foreground',
  COMPLETED:
    'border-progress-completed/60 text-progress-completed hover:bg-progress-completed/10 data-[state=on]:border-progress-completed data-[state=on]:bg-progress-completed data-[state=on]:text-progress-completed-foreground',
}
