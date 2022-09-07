import type { NextApiRequest, NextApiResponse } from "next";
import Business from "prisma/models/Business";

export default async function paypalHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("CALLED PAYPAL HOOK ROUTE");
  const triggerCancelEvents = [
    "BILLING.SUBSCRIPTION.EXPIRED",
    "BILLING.SUBSCRIPTION.CANCELLED",
    "BILLING.SUBSCRIPTION.SUSPENDED",
    "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  ];
  if (req.method === "POST") {
    const paypalSubscriptionId = req.body.resource.id;
    // TODO: i dont know if 
    const subscriptionEndsAt = req.body.resource.billing_info.next_billing_time;
    const eventType = req.body.event_type;
    if (!triggerCancelEvents.includes(eventType)) {
      return res.status(200).send("Nothing happened");
    }

    await Business.paypalUpdateSubscription(
      paypalSubscriptionId,
      subscriptionEndsAt
    );
    return res.status(200).send("Updated");
  }
  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
