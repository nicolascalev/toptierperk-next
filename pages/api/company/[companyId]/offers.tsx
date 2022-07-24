import type { NextApiRequest, NextApiResponse } from "next";
import Benefit from "../../../../prisma/models/Benefit"
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "../../../../helpers/isAuthenticated";

export default async function findCompanyOffers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await isAuthenticated(req, res);

    // TODO: if necessary integrate last payment date
    const companyId = Number(req.query.companyId);
    try {
      const offers = await Benefit.findCompanyOffers(companyId)
      return res.status(200).json(offers)
    } catch (error) {
      return res.status(500).json({ error })
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
