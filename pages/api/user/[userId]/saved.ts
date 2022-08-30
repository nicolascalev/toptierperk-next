import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import User from "prisma/models/User";

export default async function userSavedBenefitsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);
      const userId = Number(req.query.userId);
      if (session!.user.id !== userId) {
        return res.status(403).send("Forbidden");
      }
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
      const saved = await User.findSavedPerks(userId, skip, cursor);
      return res.status(200).json(saved);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
