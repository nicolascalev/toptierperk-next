import type { NextApiRequest, NextApiResponse } from "next";
import Benefit, { BenefitSearchParams } from "prisma/models/Benefit";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";

export default async function findBusinessBenfits(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await isAuthenticated(req, res);
    let session = getSession(req, res);

    // TODO: move the employee query to another endpoint, leave this for admin only
    const businessId = Number(req.query.businessId);
    if (
      session!.user.adminOfId !== businessId &&
      session!.user.business?.id !== businessId
    ) {
      return res.redirect("/403");
    }

    const q = req.query;
    const params: BenefitSearchParams = {
      beneficiaryId: businessId,
      searchString: (q.searchString as string) || undefined,
      skip: q.skip ? Number(q.skip) : undefined,
      take: q.take ? Number(q.take) : undefined,
      cursor: q.cursor ? Number(q.cursor) : undefined,
      category: q.category ? Number(q.category) : undefined,
      privacy: q.privacy
        ? q.privacy == "true"
        : q.privacy == "false"
        ? false
        : undefined,
      acquired: q.acquired
        ? q.acquired == "true"
        : q.aquired == "false"
        ? false
        : undefined,
      startsAt: (q.startsAt as string) || undefined,
    };

    try {
      const perks = await Benefit.adminBenefitSearch(params);
      return res.status(200).json(perks);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
