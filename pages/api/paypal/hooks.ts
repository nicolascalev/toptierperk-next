import type { NextApiRequest, NextApiResponse } from "next";

export default async function paypalHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("CALLED PAYPAL ROUTE");
  if (req.method === "POST") {
    console.log(req.body);
    return res.status(200).json(req.body);
  }
  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
