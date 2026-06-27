/**
 * React session provider — the app-facing surface of the auth feature.
 *
 * It derives entirely from the observable `sessionStore` via `useSyncExternalStore`,
 * so it's reactive with no effects: when any code updates the store (login,
 * refresh, a failed refresh calling `clear()`), every `useSession()` consumer
 * re-renders. That also means redirect-on-expiry is handled declaratively by
 * `RequireAuth` reacting to `status`, not by an imperative callback.
 *
 * `status` is 'loading' until localStorage is read (avoids an unauthenticated
 * flash on first paint), then 'authenticated' / 'unauthenticated'.
 */
"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { UserProfile } from "@/lib/domain/models";

import { logout as authLogout } from "../auth-client";
import { LOGIN_PATH } from "../config";
import { sessionStore } from "../session-store";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  status: SessionStatus;
  user: UserProfile | null;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

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

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
