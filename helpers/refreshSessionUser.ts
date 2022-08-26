import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import runMiddleware from "./run-middleware";
import User from "prisma/models/User";

async function refresh(req: NextApiRequest, res: NextApiResponse, next: any) {
  let session = await getSession(req, res);
  if (!session) {
    next();
  }
  if (session && session.user.emailVerified === false) {
    next(new Error("Email not verified"));
  }
  if (session && session.user) {
    const user: any = await User.findById(session.user.id);
    session.user = JSON.parse(JSON.stringify(user));
  }
  next();
}

export default async function refreshSessionUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | undefined> {
  try {
    await runMiddleware(req, res, refresh);
    return undefined;
  } catch {
    return "/email-verify";
  }
}
