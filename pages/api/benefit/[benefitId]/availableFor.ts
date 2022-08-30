import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import Benefit from "prisma/models/Benefit";

export default async function availableForHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await isAuthenticated(req, res);
    await refreshSessionUser(req, res);
    const session = getSession(req, res);

    try {
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

      const availableFor = await Benefit.availableFor(perkId)
      return res.status(200).json(availableFor || [])
    } catch (error) {
      return res.status(500).json({ error })
    }
  }
  res.status(405).json({ error: "Method or endpoint not implemented." });
}
