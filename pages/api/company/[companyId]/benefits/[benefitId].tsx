import type { NextApiRequest, NextApiResponse } from "next";
import Benefit from "prisma/models/Benefit";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import Company from "prisma/models/Company";

export default async function findCompanyBenfits(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the company acquiring the perk
      const companyId = Number(req.query.companyId);
      if (session!.user.adminOfId !== companyId) {
        return res.status(403).send("Forbidden");
      }
      const benefitId = Number(req.query.benefitId);
      const acquireStatus = await Company.checkAvailableBenefit(companyId, benefitId);
      return res.status(200).json(acquireStatus);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  if (req.method === "PUT") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the company acquiring the perk
      const companyId = Number(req.query.companyId);
      if (session!.user.adminOfId !== companyId) {
        return res.status(403).send("Forbidden");
      }

      // make sure that the company has a paidSubscription
      const company = await Company.findById(companyId);
      if (!company?.paidMembership) {
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

      // TODO ROADMAP check that the company can aquire this perk, based on the subscription

      // Tvalidate that benefit is availablefor company, then do the query to update
      const { perkIsAvailable } = await Company.checkAvailableBenefit(
        companyId,
        benefitId
      );
      if (!perkIsAvailable) {
        return res
          .status(401)
          .json({ error: "This perk is not available for your company." });
      }

      await Company.acquireBenefit(companyId, benefitId);

      return res.status(204).send("Updated perks list");
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  if (req.method === "DELETE") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);

      // check the logged in user is the adming of the company acquiring the perk
      const companyId = Number(req.query.companyId);
      if (session!.user.adminOfId !== companyId) {
        return res.status(403).send("Forbidden");
      }

      const benefitId = Number(req.query.benefitId);

      await Company.looseBenefit(companyId, benefitId);

      return res.status(204).send("Updated perks list");;
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
