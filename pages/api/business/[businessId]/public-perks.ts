import type { NextApiRequest, NextApiResponse } from "next";
import Business from "prisma/models/Business";

export default async function businessPublicOffersHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const businessId = Number(req.query.businessId);
      const params = {
        business: businessId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      };
      const business = await Business.findById(businessId);
      if (!business) {
        return res
          .status(404)
          .json({ message: "Business with that id not found" });
      }
      const perks = await Business.findPublicPerks(params);
      return res.status(200).json(perks);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
