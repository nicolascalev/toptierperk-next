import type { NextApiRequest, NextApiResponse } from "next";
import Business from "prisma/models/Business";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import paypal from "helpers/paypal";

export default async function findBusinessByNameHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      const session = getSession(req, res);

      const businessId = Number(req.query.businessId);
      // The user can't be trying to update a business who does not belong to them
      if (businessId !== session!.user.adminOfId) {
        return res.status(403).send("Forbidden");
      }

      const subscriptionId = session!.user.adminOf.paypalSubscriptionId;
      if (!subscriptionId) {
        return res
          .status(400)
          .json({ message: "This business does not have a subscription." });
      }

      const subscription = await paypal.getSubscriptionById(subscriptionId);
      return res.status(200).json(subscription);
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  if (req.method === "PATCH") {
    await isAuthenticated(req, res);
    await refreshSessionUser(req, res);
    let session = getSession(req, res);

    const businessId = Number(req.query.businessId);
    const subscriptionId = req.body.subscriptionId;
    // The user can't be trying to update a business who does not belong to them
    if (businessId !== session!.user.adminOfId) {
      return res.status(401).send("Unauthorized");
    }
    try {
      const result = await Business.updateSubscription(
        businessId,
        subscriptionId,
        true,
        null
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
      return res.status(500).json(error);
    }
  }

  if (req.method === "DELETE") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);

      const businessId = Number(req.query.businessId);
      // The user can't be trying to update a business who does not belong to them
      if (businessId !== session!.user.adminOfId) {
        return res.status(403).send("Forbidden");
      }

      const paypalSubscriptionId = session!.user.adminOf.paypalSubscriptionId;
      if (!paypalSubscriptionId) {
        return res
          .status(400)
          .json({ message: "This business does not have a subscription." });
      }

      const paypalSub = await paypal.getSubscriptionById(paypalSubscriptionId);
      const reason = req.body.reason || "";
      await paypal.cancelSubscription(paypalSubscriptionId, reason);
      const result = await Business.updateSubscription(
        businessId,
        paypalSubscriptionId,
        undefined,
        paypalSub.billing_info.next_billing_time
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
      return res.status(500).json(error);
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
