import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import runMiddleware from "./run-middleware";
import User from "prisma/models/User";

async function authorizationCheck(req: NextApiRequest, res: NextApiResponse, next: any) {
  const session = await getSession(req, res);
  const userId = Number(session!.user.id);
  const user = await User.findById(userId);

  if (user!.authorizationChanged) {
    res.status(401).json({ code: "E_AUTHORIZATION_CHANGED", message: "Your authorization changed" });
    next(new Error("Unauthorized"))
  } else {
    res.status(401).send("Unauthorized");
    next(new Error("Unauthorized"))
  }
}

export default async function checkAuthorizationChange(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, authorizationCheck)
  } catch (err) {
    return res
  }
}