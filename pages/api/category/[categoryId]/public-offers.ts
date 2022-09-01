import type { NextApiRequest, NextApiResponse } from "next";
import Category from "prisma/models/Category";

export default async function categoryPublicOffers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categoryId = Number(req.query.categoryId);
      const params = {
        category: categoryId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      };
      const offers = await Category.findPublicOffers(params);
      return res.status(200).json(offers);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
