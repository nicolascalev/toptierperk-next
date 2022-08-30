import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import User from "prisma/models/User";

export default async function checkUserSavedBenefitHandler(
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
      const benefitId = Number(req.query.benefitId);
      const check = await User.checkSavedPerk(userId, benefitId);
      const saved = check ? true : false;
      return res.status(200).json({ saved });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  if (req.method == "POST") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);
      const userId = Number(req.query.userId);
      if (session!.user.id !== userId) {
        return res.status(403).send("Forbidden");
      }
      const benefitId = Number(req.query.benefitId);

      await User.savePerk(userId, benefitId);
      return res.status(200).send("Saved");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  if (req.method == "DELETE") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);
      const userId = Number(req.query.userId);
      if (session!.user.id !== userId) {
        return res.status(403).send("Forbidden");
      }
      const benefitId = Number(req.query.benefitId);

      await User.deleteSavedPerk(userId, benefitId);
      return res.status(200).send("Removed from saved");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
