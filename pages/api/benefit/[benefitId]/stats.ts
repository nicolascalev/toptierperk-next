import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Benefit from "prisma/models/Benefit";

export default async function benefitStatsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      const session = getSession(req, res);
      const perkId = Number(req.query.benefitId);
      const perk = await Benefit.findById(perkId);
      if (!perk) {
        return res
          .status(404)
          .json({ error: `Perk with the id ${perkId} was not found` });
      }
      if (perk.supplier.id !== session!.user.adminOfId) {
        return res.status(403).send("Forbidden");
      }

      const stats = await Benefit.findBenefitStats(perkId)
      return res.status(200).json(stats?._count);
    } catch (err) {
      return res.status(500).json(err)
    }
  }
  res.status(405).json({ error: "Method or endpoint not implemented." });
}
