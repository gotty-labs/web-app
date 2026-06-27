/** Access the current session ({ status, user, signOut }) from `SessionProvider`. */
"use client";

import { useContext } from "react";

import { SessionContext, type SessionContextValue } from "../contexts/session-provider";

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
