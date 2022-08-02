import type { NextApiRequest, NextApiResponse } from "next";
import Category from "prisma/models/Category";

export default async function categoryHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const params = {
        searchString: (req.query.searchString as string) || "",
      };
      const categories = await Category.find(params);
      return res.status(200).json(categories);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
