import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Benefit from "prisma/models/Benefit";
import Claim from "prisma/models/Claim";
import Business from "prisma/models/Business";
import formatDate from "helpers/formatDate";

export default async function ClaimHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await isAuthenticated(req, res);
      const session = getSession(req, res);
      const now = Date.now();

      // check the logged user belongs to a company
      if (!session!.user.business) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message: "You must belong to a business first",
        });
      }

      // get claiming perk
      const perkId = Number(req.query.benefitId);
      const perk = await Benefit.findById(perkId);
      console.log({ perk });
      if (!perk!.isActive) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message: "This perk is not active for claims",
        });
      }

      // get employer
      const employer = await Business.findById(session!.user.business.id);
      if (!employer!.paidMembership) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message:
            "Your employer needs to confirm this perk is available for subscription issues",
        });
      }

      // get supplier
      const supplier = await Business.findById(perk!.supplierId);
      if (!supplier!.paidMembership) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message:
            "Perk currently unavailable, needs confirmation from supplier",
        });
      }

      // check that this perk has been acquired by your employer
      const acquireStatus = await Business.checkAvailableBenefit(
        employer!.id,
        perkId
      );
      if (!acquireStatus.perkIsAcquired) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message: "This perk has not been acquired by your employer",
        });
      }

      // check that now is in between allowed dates
      let startsAt = perk!.startsAt ? perk!.startsAt.getTime() : null;
      let finishesAt = perk!.finishesAt ? perk!.finishesAt.getTime() : null;
      if (startsAt && now < startsAt) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message: `This perk will be available on ${formatDate(
            perk!.startsAt,
            "SHORT_TEXT"
          )}`,
        });
      }
      if (finishesAt && now > finishesAt) {
        return res.status(400).json({
          code: "E_NOT_ALLOWED",
          message: `This perk has not been available since ${formatDate(
            perk!.finishesAt,
            "SHORT_TEXT"
          )}`,
        });
      }

      // get user claims with that benefit id
      const userId = session!.user.id;
      const claims = await Claim.findBenefitUserClaims(perkId, userId);
      // check valid use limit
      if (perk!.useLimit) {
        if (perk!.claimAmount >= perk!.useLimit) {
          return res.status(400).json({
            code: "E_NOT_ALLOWED",
            message: "This perk reached use limit amount",
          });
        }
      }

      // check if user has reached the limit of uses for this perk
      if (perk!.useLimitPerUser) {
        if (claims.length >= perk!.useLimitPerUser) {
          return res.status(400).json({
            code: "E_NOT_ALLOWED",
            message: "You have reached limit of uses for this perk",
          });
        }
      }

      // if finally passed all validations, then create the claim
      const claim = await Claim.create(userId, perkId, employer!.id, supplier!.id);
      return res.status(200).json(claim);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  return res.status(405).json({ error: "Method or endpoint not implemented." });
}
