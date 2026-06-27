/**
 * React session provider + context — the app-facing surface of the auth feature.
 *
 * Derives entirely from the observable `sessionStore` via `useSyncExternalStore`,
 * so it's reactive with no effects: any store update (login, refresh, a failed
 * refresh calling `clear()`) re-renders every `useSession()` consumer. Redirect-
 * on-expiry is handled declaratively by `RequireAuth` reacting to `status`.
 *
 * The `useSession` hook lives in `../hooks/use-session` (per the hooks/ convention);
 * the raw `SessionContext` is exported here for it to consume.
 */
"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { UserProfile } from "@/lib/domain/models";

import { LOGIN_PATH } from "../config/config";
import { logout as authLogout } from "../services/auth-client";
import { sessionStore } from "../stores/session-store";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionContextValue {
  status: SessionStatus;
  user: UserProfile | null;
  signOut: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );

  const status: SessionStatus = !snapshot.hydrated
    ? "loading"
    : snapshot.session
      ? "authenticated"
      : "unauthenticated";
  const user = snapshot.session?.user ?? null;

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      signOut: async () => {
        await authLogout();
        router.replace(LOGIN_PATH);
      },
    }),
    [status, user, router],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
