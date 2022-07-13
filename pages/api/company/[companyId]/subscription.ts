import type { NextApiRequest, NextApiResponse } from "next";
import Company from "../../../../prisma/models/Company";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "../../../../helpers/isAuthenticated";

export default async function findCompanyByNameHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    await isAuthenticated(req,res)
    // TODO: add isAdmin validation
    let session = getSession(req, res);

    // TODO: if necessary integrate last payment date
    const companyId = Number(req.query.companyId)
    const subscriptionId = req.body.subscriptionId
    try {
      const result = await Company.updateSubscription(companyId, subscriptionId);
      session!.user = {
        ...session!.user,
        ...{
          company: result,
          adminOf: result,
        },
      };
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }


  return res
      .status(405)
      .json({ message: "Method or endpoint not implemented." });
}
