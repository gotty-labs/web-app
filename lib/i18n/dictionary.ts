/**
 * Dictionary loading (Next docs' "Localization" pattern). Translations live in
 * `dictionaries/<locale>.json` — the SINGLE source of copy, used everywhere
 * (errors + UI + game enum labels). The JSON is dynamically imported so only the
 * ACTIVE locale's file is code-split into the bundle (works on server AND client).
 *
 * The shape is validated with Zod on load (fail-loud): a missing/renamed key in
 * any locale file throws here instead of rendering `undefined`. The `Dictionary`
 * TYPE is inferred from that schema — one source of truth. Game enum labels MUST
 * be localized here (never humanized in code), so a Spanish user reads "Rumoreado",
 * not "Rumored".
 */
import { z } from 'zod'

import {
  gameCategorySchema,
  gameGenreSchema,
  gameLibraryProgressStateSchema,
  gameStatusSchema,
  gameThemeSchema,
  userGameLibraryStatusSchema,
} from '@/lib/domain/enums'

import { defaultLocale, type Locale } from './locales'

const errorByCodeSchema = z.object({
  invalidCredentials: z.string(),
  resetLinkExpired: z.string(),
  userNotFound: z.string(),
  invalidOAuthCredentials: z.string(),
  guestNotAllowed: z.string(),
  registerUnavailable: z.string(),
  oauthAlreadyRegistered: z.string(),
  invalidVerificationCode: z.string(),
  gameNotFound: z.string(),
  listNameExists: z.string(),
  webNotAllowed: z.string(),
})

/** A localized label for EVERY value of an enum — fail-loud if a locale omits one. */
const enumLabels = (values: readonly string[]) =>
  z.object(Object.fromEntries(values.map((value) => [value, z.string()])))

/** A landing block with a heading + supporting copy (feature cards, how-it-works steps). */
const landingFeatureSchema = z.object({
  title: z.string(),
  description: z.string(),
})

export const dictionarySchema = z.object({
  errors: z.object({
    byCode: errorByCodeSchema,
    generic: z.object({
      rateLimit: z.string(),
      server: z.string(),
      network: z.string(),
      validation: z.string(),
      sessionExpired: z.string(),
      unknown: z.string(),
    }),
  }),
  games: z.object({
    status: enumLabels(gameStatusSchema.options),
    category: enumLabels(gameCategorySchema.options),
    genre: enumLabels(gameGenreSchema.options),
    theme: enumLabels(gameThemeSchema.options),
    progressState: enumLabels(gameLibraryProgressStateSchema.options),
    libraryStatus: enumLabels(userGameLibraryStatusSchema.options),
  }),
  app: z.object({
    brand: z.object({
      name: z.string(),
      tagline: z.string(),
    }),
    actions: z.object({
      enterApp: z.string(),
      signIn: z.string(),
      signUp: z.string(),
      continue: z.string(),
      cancel: z.string(),
      back: z.string(),
      retry: z.string(),
    }),
    landing: z.object({
      heroBadge: z.string(),
      heroTitleLead: z.string(),
      heroTitleAccent: z.string(),
      heroSubtitle: z.string(),
      primaryCta: z.string(),
      secondaryCta: z.string(),
      nav: z.object({
        features: z.string(),
        how: z.string(),
      }),
      mock: z.object({
        trending: z.string(),
        library: z.string(),
        search: z.string(),
      }),
      features: z.object({
        title: z.string(),
        subtitle: z.string(),
        discover: landingFeatureSchema,
        search: landingFeatureSchema,
        library: landingFeatureSchema,
        progress: landingFeatureSchema,
      }),
      how: z.object({
        title: z.string(),
        subtitle: z.string(),
        steps: z.array(landingFeatureSchema).length(3),
      }),
      cta: z.object({
        title: z.string(),
        subtitle: z.string(),
        button: z.string(),
      }),
      footer: z.object({
        rights: z.string(),
      }),
    }),
    nav: z.object({
      games: z.string(),
      options: z.string(),
      feed: z.string(),
      library: z.string(),
      search: z.string(),
      consoleVisibility: z.string(),
      feedback: z.string(),
    }),
    consoleVisibility: z.object({
      title: z.string(),
      description: z.string(),
      showAll: z.string(),
      hideAll: z.string(),
      save: z.string(),
      savedToast: z.string(),
    }),
    feedback: z.object({
      title: z.string(),
      description: z.string(),
      typeLabel: z.string(),
      typeIdea: z.string(),
      typeImprovement: z.string(),
      typeProblem: z.string(),
      typeOther: z.string(),
      messageLabel: z.string(),
      messagePlaceholder: z.string(),
      metadataLabel: z.string(),
      appField: z.string(),
      systemField: z.string(),
      localeField: z.string(),
      privacyNote: z.string(),
      replyLabel: z.string(),
      emailPlaceholder: z.string(),
      submit: z.string(),
      sentToast: z.string(),
    }),
    profile: z.object({
      account: z.string(),
      settings: z.string(),
      notifications: z.string(),
      consoleExclusions: z.string(),
      logout: z.string(),
      version: z.string(),
    }),
    feed: z.object({
      loadMore: z.string(),
      empty: z.string(),
      error: z.string(),
    }),
    search: z.object({
      placeholder: z.string(),
      submit: z.string(),
      consoles: z.string(),
      genreTheme: z.string(),
      all: z.string(),
      genres: z.string(),
      themes: z.string(),
      prompt: z.string(),
      noResults: z.string(),
      reset: z.string(),
      clear: z.string(),
    }),
    detail: z.object({
      save: z.string(),
      saved: z.string(),
      whitelist: z.string(),
      updateProgress: z.string(),
      signInToSave: z.string(),
      moreActions: z.string(),
      savedToast: z.string(),
      whitelistToast: z.string(),
      progress: z.object({
        title: z.string(),
        description: z.string(),
        durationLabel: z.string(),
        durationPlaceholder: z.string(),
        save: z.string(),
        updatedToast: z.string(),
      }),
    }),
    library: z.object({
      savedTab: z.string(),
      whitelistTab: z.string(),
      listsLabel: z.string(),
      allLists: z.string(),
      savedEmpty: z.string(),
      whitelistEmpty: z.string(),
    }),
    settings: z.object({
      title: z.string(),
      email: z.object({
        title: z.string(),
        verified: z.string(),
        unverified: z.string(),
        verifyCta: z.string(),
        modalTitle: z.string(),
        sentTo: z.string(),
        confirm: z.string(),
        resend: z.string(),
        successToast: z.string(),
      }),
      consoles: z.object({
        title: z.string(),
        description: z.string(),
        save: z.string(),
        savedToast: z.string(),
      }),
      password: z.object({
        title: z.string(),
        description: z.string(),
        cta: z.string(),
        sentToast: z.string(),
      }),
    }),
    onboarding: z.object({
      title: z.string(),
      description: z.string(),
      cta: z.string(),
    }),
    errorModal: z.object({
      title: z.string(),
      dismiss: z.string(),
    }),
    auth: z.object({
      loginTitle: z.string(),
      loginDescription: z.string(),
      registerTitle: z.string(),
      registerDescription: z.string(),
      forgotTitle: z.string(),
      forgotDescription: z.string(),
      emailLabel: z.string(),
      emailPlaceholder: z.string(),
      passwordLabel: z.string(),
      passwordPlaceholder: z.string(),
      nicknameLabel: z.string(),
      nicknamePlaceholder: z.string(),
      submitLogin: z.string(),
      submitRegister: z.string(),
      submitForgot: z.string(),
      forgotLink: z.string(),
      googleContinue: z.string(),
      googleUnavailable: z.string(),
      orSeparator: z.string(),
      noAccountPrompt: z.string(),
      haveAccountPrompt: z.string(),
      forgotSentTitle: z.string(),
      forgotSentDescription: z.string(),
      backToLogin: z.string(),
    }),
  }),
})

export type Dictionary = z.infer<typeof dictionarySchema>
export type ErrorByCodeKey = keyof Dictionary['errors']['byCode']

const loaders: Record<Locale, () => Promise<unknown>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const raw = await (loaders[locale] ?? loaders[defaultLocale])()
  return dictionarySchema.parse(raw)
}
