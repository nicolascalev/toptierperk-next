import type { NextApiRequest, NextApiResponse } from "next";
import Benefit from "prisma/models/Benefit";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Business from "prisma/models/Business";

export default async function findBusinessBenfits(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the business acquiring the perk
      const businessId = Number(req.query.businessId);
      if (
        session!.user.adminOfId !== businessId &&
        session!.user.business?.id !== businessId
      ) {
        return res.status(403).send("Forbidden");
      }
      const benefitId = Number(req.query.benefitId);
      const acquireStatus = await Business.checkAvailableBenefit(
        businessId,
        benefitId
      );
      return res.status(200).json(acquireStatus);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  if (req.method === "PUT") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the business acquiring the perk
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      // make sure that the business has a paidSubscription
      const business = await Business.findById(businessId);
      if (!business?.paidMembership) {
        return res.status(402).json({ error: "Payment required" });
      }

      // make sure the suplier also has a paid membership
      const benefitId = Number(req.query.benefitId);
      const benefit = await Benefit.findById(benefitId);
      if (!benefit?.supplier.paidMembership) {
        return res.status(402).json({
          error: "The perk supplier can't confirm this offer right now",
        });
      }

      // TODO ROADMAP check that the business can aquire this perk, based on the subscription

      // Tvalidate that benefit is availablefor business, then do the query to update
      const { perkIsAvailable } = await Business.checkAvailableBenefit(
        businessId,
        benefitId
      );
      if (!perkIsAvailable) {
        return res
          .status(401)
          .json({ error: "This perk is not available for your business." });
      }

      await Business.acquireBenefit(businessId, benefitId);

      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  if (req.method === "DELETE") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the business acquiring the perk
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      const benefitId = Number(req.query.benefitId);

      await Business.looseBenefit(businessId, benefitId);

      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
