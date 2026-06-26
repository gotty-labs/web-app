/**
 * BFF register (§4.1). Email or OAuth (Apple/Google) registration; on success
 * the backend returns a full user with a session, which we persist exactly like
 * login.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiRequest } from "@/lib/api/client";
import { userSchema } from "@/lib/domain/models";

import { errorResponse, sessionResponse } from "../_shared";

const bodySchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("email"),
    email: z.string(),
    nickname: z.string(),
    password: z.string(),
  }),
  z.object({ provider: z.literal("google"), token: z.string(), nickname: z.string() }),
  z.object({ provider: z.literal("apple"), token: z.string(), nickname: z.string() }),
]);

const PATH = {
  email: "/auth/register-email",
  google: "/auth/register-google",
  apple: "/auth/register-apple",
} as const;

export async function POST(request: Request): Promise<NextResponse> {
  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const backendBody =
    input.provider === "email"
      ? { email: input.email, nickname: input.nickname, password: input.password }
      : { token: input.token, nickname: input.nickname };

  try {
    const user = await apiRequest({
      method: "POST",
      path: PATH[input.provider],
      body: backendBody,
      schema: userSchema,
    });
    return await sessionResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
