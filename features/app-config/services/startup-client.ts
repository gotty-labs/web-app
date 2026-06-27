/**
 * Startup gate (§4.4). `GET /config/startup` should be the FIRST business call
 * after obtaining a session: it drives the force-update gate and the verify-email
 * nudge.
 *
 * On WEB, `version` is omitted by the backend (no store / force-update concept),
 * so only `needVerifiedEmail` is actionable here. We still return the full DTO in
 * case `version` ever appears.
 *
 * Client-side: goes through `authedRequest` (web is always authenticated, so we
 * send the access token + get refresh handling for free).
 */
import { authedRequest } from "@/features/auth";
import { startupSchema, type Startup } from "@/lib/domain/models";

export function getStartup(): Promise<Startup> {
  return authedRequest({
    method: "GET",
    path: "/config/startup",
    schema: startupSchema,
  });
}
