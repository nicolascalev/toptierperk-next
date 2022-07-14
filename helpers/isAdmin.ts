import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import runMiddleware from "./run-middleware";

async function adminCheck(req: NextApiRequest, res: NextApiResponse, next: any) {
  const session = await getSession(req, res);
  if (!session || !session.user.adminOf) {
    res.status(401);
    next(new Error("Unauthorized"))
  }
  next()
}

export default async function isAdmin(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, adminCheck)
  } catch (err) {
    return res.status(401).send("Unauthorized")
  }
}