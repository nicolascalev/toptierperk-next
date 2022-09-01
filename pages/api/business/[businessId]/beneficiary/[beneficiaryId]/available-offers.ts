import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import { getSession } from "@auth0/nextjs-auth0";
import Business from "prisma/models/Business";

export default async function businessAOffersAcquiredByBusinessBHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Fetch business A's offers where offers are public or acquired by business B
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);
      
      if (!session!.user.businessId) {
        return res.status(401).json({ message: "User needs to belong to a business" });
      }

      const beneficiaryId = Number(req.query.beneficiaryId);
      if (session!.user.businessId !== beneficiaryId) {
        return res.status(403).send("Forbidden");
      }
      const businessB = await Business.findById(beneficiaryId);
      if (isNaN(beneficiaryId) || !businessB) {
        return res.status(404).json({ message: "A business with that beneficiaryId was not found" })
      }

      const businessId = Number(req.query.businessId);
      const businessA = await Business.findById(businessId);
      if (isNaN(businessId) || !businessA) {
        return res.status(404).json({ message: "A business with that businessId was not found" })
      }

      const params = {
        businessA: businessId,
        businessB: beneficiaryId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      };
      const offers = await Business.findBusinessOffersWherePublicOrAcquiredByBeneficiary(params);
      return res.status(200).json(offers);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
