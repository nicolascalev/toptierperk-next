import type { NextApiRequest, NextApiResponse } from "next";
import Category from "prisma/models/Category";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import { getSession } from "@auth0/nextjs-auth0";

export default async function categoryPublicOffers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);

      if (!session!.user.businessId) {
        return res.status(401).json({ message: "User needs to join a business first" })
      }

      const categoryId = Number(req.query.categoryId);
      const params = {
        category: categoryId,
        business: session!.user.businessId,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        cursor: req.query.skip ? Number(req.query.cursor) : undefined,
      };
      const perks = await Category.findCategoryBusinessPerks(params);
      return res.status(200).json(perks);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
