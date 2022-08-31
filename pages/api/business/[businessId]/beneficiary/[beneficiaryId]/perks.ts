import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import { getSession } from "@auth0/nextjs-auth0";
import Business from "prisma/models/Business";

export default async function businessPublicOffersHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);

      const beneficiaryId = Number(req.query.beneficiaryId);
      if (session!.user.businessId !== beneficiaryId) {
        return res.status(403).send("Forbidden");
      }

      const businessId = Number(req.query.businessId);
      const params = {
        supplierId: businessId,
        beneficiaryId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      };
      const offers = await Business.findBenefitsFromSupplier(params);
      return res.status(200).json(offers);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
