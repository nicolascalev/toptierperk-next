import type { NextApiRequest, NextApiResponse } from "next";
import Business from "../../../../prisma/models/Business";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "../../../../helpers/isAuthenticated";
import isAdmin from "../../../../helpers/isAdmin";

export default async function findBusinessByNameHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    await isAuthenticated(req, res);
    await isAdmin(req, res);

    let session = getSession(req, res);

    // TODO: if necessary integrate last payment date
    const businessId = Number(req.query.businessId);
    const subscriptionId = req.body.subscriptionId;
    // The user can't be trying to update a business who does not belong to them
    if (businessId !== session!.user.adminOf.id) {
      return res.status(401).send("Unauthorized");
    }
    try {
      const result = await Business.updateSubscription(
        businessId,
        subscriptionId
      );
      session!.user = {
        ...session!.user,
        ...{
          business: result,
          adminOf: result,
        },
      };
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
