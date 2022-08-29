import type { NextApiRequest, NextApiResponse } from "next";
import { handleAuth, handleCallback, Session } from "@auth0/nextjs-auth0";
import User from "../../../prisma/models/User";

const afterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) => {
  try {
    let auth0User = session.user;
    const [nickname] = auth0User.email.split("@");
    auth0User.username = nickname + Date.now();
    auth0User.auth0sub = auth0User.sub;
    auth0User.emailVerified = auth0User.email_verified;

    let existingUser = await User.findByAuth0Sub(auth0User.auth0sub);
    if (existingUser?.emailVerified === false && auth0User.email_verified === true) {
      existingUser = await User.setVerifiedEmail(existingUser.id, true);
    }
    if (existingUser) {
      await User.setAuthorizationChanged(existingUser.id, false);
      existingUser.authorizationChanged = false;
    }
    session.user = existingUser ? existingUser : null;

    if (!session.user) {
      auth0User.name = auth0User.name || auth0User.username;
      session.user = await User.create(auth0User);
    }

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
