import type { NextApiRequest, NextApiResponse } from "next";
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import User from "../../../prisma/models/User";

const afterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: any,
) => {
  try {
    let auth0User = session.user;
    const [nickname] = auth0User.email.split("@");
    auth0User.username = nickname + Date.now();
    auth0User.auth0sub = auth0User.sub;
    session.user = await User.upsert(auth0User);
    return session;
  } catch (err) {
    throw err;
  }
};

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error) {
      res.end(error);
    }
  },
});
