import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Business from "prisma/models/Business";

export default async function allowedEmailsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "PATCH") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }
      const allowedEmailsJson = req.body.allowedEmails;
      const updated = await Business.updateAllowedEmails(businessId, allowedEmailsJson);
      session!.user.adminOf.allowedEmployeeEmails = updated.allowedEmployeeEmails;
      session!.user.business.allowedEmployeeEmails = updated.allowedEmployeeEmails;
      return res.status(200).json(updated.allowedEmployeeEmails);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
