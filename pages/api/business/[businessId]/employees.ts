import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Business from "prisma/models/Business";
import isAdmin from "helpers/isAdmin";


export default async function businessHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    try {
      await isAuthenticated(req, res);
      await isAdmin(req, res);
      const businessId = Number(req.query.businessId);
      const searchString = req.query.searchString as string || "";
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
      const result = await Business.findEmployees({ businessId, searchString, skip, cursor });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}