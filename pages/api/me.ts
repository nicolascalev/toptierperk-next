import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import User from "prisma/models/User";

// this route can return the updated user and update session
export default async function meHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let session = getSession(req, res);
  if (!session) {
    return res.status(204).end();
  }
  const user = await User.findById(session.user.id);
  session.user = JSON.parse(JSON.stringify(user));
  const redirect = req.query.redirect as string;
  if (redirect) {
    return res.redirect(redirect);
  }
  return res.status(200).json(user);
}
