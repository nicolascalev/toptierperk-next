import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import User from "prisma/models/User";
import Business from "prisma/models/Business";

export default async function userBusinessHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "PATCH") {
    try {
      await isAuthenticated(req, res);
      const session = getSession(req, res);
      const userId = Number(req.query.userId);
      if (session!.user.id !== userId) {
        return res.status(403).send("Forbidden");
      }
      const businessId = Number(req.query.businessId);
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).send("Business not found");
      }
      const allowedEmails = JSON.parse(
        business.allowedEmployeeEmails as string
      );
      if (!allowedEmails.includes(session!.user.email)) {
        return res.status(401).send("Unauthorized");
      }

      const updatedUser = await User.joinBusiness(userId, businessId);
      return res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
