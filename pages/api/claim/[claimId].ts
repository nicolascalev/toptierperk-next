import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
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
      await refreshSessionUser(req, res);
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

  if (req.method === "PATCH") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);
      const user: User = session!.user as User;

      const claimId = Number(req.query.claimId);
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res
          .status(404)
          .send("We could not find that claim, it was possibly deleted");
      }

      const isAdminOrVerifier = user.adminOfId || user.canVerify;
      const belongsToSupplier = user.businessId === claim.supplierId;
      if (!isAdminOrVerifier || !belongsToSupplier) {
        return res
          .status(403)
          .send("You don't have permission to confirm this claim");
      }

      // check supplier has a paid sub
      if (!claim.supplier!.paidMembership) {
        return res
          .status(402)
          .send("The supplier needs to renew their subscription");
      }

      // validate that logged user still belongs to the company that acquired the perk
      if (user.businessId !== claim.businessId) {
        return res
          .status(403)
          .send(
            "User no longer belongs to the business that acquired this perk"
          );
      }

      if (claim.approvedAt !== null) {
        return res
          .status(400)
          .send("This claim was already verified, user can't redeem twice");
      }

      if (
        claim.benefit!.useLimit &&
        claim.benefit!.useLimit <= claim.benefit!.claimAmount
      ) {
        return res
          .status(400)
          .send("This perk reached use limit amount before user redeemed it");
      }

      const approvedAt =
        "Invalid Date" == new Date(req.body.approvedAt).toString()
          ? new Date()
          : new Date(req.body.approvedAt);

      // check for expiration date, if now is after finishesAt then not allowed
      if (
        claim.benefit!.finishesAt &&
        approvedAt.getTime() > claim.benefit!.finishesAt.getTime()
      ) {
        return res.status(400).send("That perk expired");
      }

      const updatedClaim = await Claim.approve(claimId, approvedAt);
      return res.status(200).json(updatedClaim);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  if (req.method === "DELETE") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);
      const user: User = session!.user as User;

      const claimId = Number(req.query.claimId);
      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).send("Not Found");
      }

      if (claim.approvedAt) {
        return res
          .status(400)
          .json({
            message:
              "You can't delete this claim because it has already been approved",
          });
      }

      if (user.id !== claim.userId) {
        return res.status(403).send("Forbidden");
      }

      await Claim.delete(claimId);
      return res.status(200).send("Claim deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
