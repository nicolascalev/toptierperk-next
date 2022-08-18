import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "helpers/isAuthenticated";
import { getSession } from "@auth0/nextjs-auth0";
import Claim from "prisma/models/Claim";
import type { User } from "@prisma/client";

export default async function claimHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);
      const user: User = session!.user as User;

      const claimId = Number(req.query.claimId);
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).send("Not Found");
      }
      const userIsClaimer = claim.userId === user.id;
      // if user can verify and belongs to perk supplier business
      const userIsVerifierOfSupplier =
        (user.canVerify || user.adminOfId) &&
        user.businessId === claim.supplierId
          ? true
          : false;
      if (!userIsClaimer && !userIsVerifierOfSupplier) {
        return res.status(403).send("Forbidden");
      }
      return res.status(200).json(claim);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
