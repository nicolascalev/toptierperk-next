import type { NextApiRequest, NextApiResponse } from "next";
import Benefit, { BenefitStatus } from "prisma/models/Benefit"
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";

export default async function findBusinessOffers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // TODO decide wether this endpoint should be isAuthenticated
    await isAuthenticated(req, res);
    await refreshSessionUser(req, res);
    let session = getSession(req, res);

    // TODO: if necessary integrate last payment date
    const businessId = Number(req.query.businessId);
    let status = req.query.status as BenefitStatus || "ACTIVE"
    if (!["ALL", "ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ error: "status should be ALL, ACTIVE or INACTIVE" })
    }
    if (status == "INACTIVE" || status == "ALL") {
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden")
      }
    }
    try {
      const offers = await Benefit.findBusinessOffers(businessId, status)
      return res.status(200).json(offers)
    } catch (error) {
      return res.status(500).json({ error })
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
