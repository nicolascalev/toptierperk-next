import type { NextApiRequest, NextApiResponse } from "next";
import isAuthenticated from "helpers/isAuthenticated";
import { getSession } from "@auth0/nextjs-auth0";
import Feedback, { FeedbackCreate } from "prisma/models/Feedback";
import Joi from "joi";

const createFeedbackSchema = Joi.object({
  benefit: Joi.number(),
  claim: Joi.number(),
  reporter: Joi.number(),
  feedback: Joi.string().min(35).max(1000).required(),
  type: Joi.string().required(),
  location: Joi.string().required(),
  mood: Joi.number().min(1).max(5).required(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await isAuthenticated(req, res);
      let session = getSession(req, res);
      const data: FeedbackCreate = {
        benefit: req.body.benefit,
        claim: req.body.claim,
        reporter: session!.user.id,
        feedback: req.body.feedback,
        type: req.body.type,
        location: req.body.location,
        mood: req.body.mood,
      };
      const { value: validatedData, error: validationError } =
        createFeedbackSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      console.log(validatedData);
      const feedback = await Feedback.create(validatedData);
      return res.status(200).json(feedback);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
