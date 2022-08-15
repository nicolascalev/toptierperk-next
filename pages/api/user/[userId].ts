import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Joi from "joi";
import isAuthenticated from "helpers/isAuthenticated";
import parseFormData from "helpers/parse-form-data";
import uploadFile from "helpers/upload-file";
import User from "prisma/models/User";

export const config = {
  api: {
    bodyParser: false,
  },
};

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  username: Joi.string()
    .regex(/^[a-z0-9_.]+$/)
    .min(2)
    .max(40)
    .required(),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export default async function singleBenefitHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "PATCH") {
    try {
      await isAuthenticated(req, res);
      await parseFormData(req, res);
      const session = getSession(req, res);
      const userId = Number(req.query.userId);
      if (session!.user.id !== userId) {
        return res.status(403).send("Forbidden");
      }

      const data = {
        name: req.body.name,
        username: req.body.username,
      };

      const { value: validatedData, error: validationError } =
        updateUserSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (req.files.picture) {
        const upload = await uploadFile([req.files.picture], `users/`);
        const uploadedPicture = { url: upload.success[0].Location };
        validatedData.picture = uploadedPicture;
      }

      const updated = await User.update(userId, validatedData);
      if (updated) {
        session!.user = updated;
      }
      return res.status(200).json(updated);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
