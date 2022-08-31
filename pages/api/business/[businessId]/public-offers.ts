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
        supplierId: businessId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      }
      const offers = await Business.findPublicOffers(params);
      return res.status(200).json(offers)
    } catch (error) {
      return res.status(500).json({ error })
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
