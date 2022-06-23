// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "../../helpers/isAuthenticated";
import { getSession } from "@auth0/nextjs-auth0";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await isAuthenticated(req, res)
  let session = getSession(req, res)
  return res.status(200).json(session);
}
