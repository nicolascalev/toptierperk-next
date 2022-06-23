import type { NextApiRequest, NextApiResponse } from "next";
import User, { UserSearchParams } from "../../../prisma/models/User";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method } = req;

  switch (method) {
    case "GET":
      try {
        const params: UserSearchParams = {
          searchString: <string>query.searchString || "",
          skip: Number(query.skip) || undefined,
          take: Number(query.take) || undefined,
          orderBy: <"asc" | "desc">query.orderBy || "desc",
        };
        const result = await User.find(params);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(err);
      }
      break;
    default:
      res.status(400).json({ message: "Method or endpoint not implemented." });
  }
}
