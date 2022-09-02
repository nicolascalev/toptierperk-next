import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import Business from "prisma/models/Business";
import Joi from "joi";
import parseFormData from "helpers/parse-form-data";
import uploadFile from "helpers/upload-file";

const updateBusinessSchema = Joi.object({
  name: Joi.string().required().max(30),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  about: Joi.string().required().max(500),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function singleBusinessHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    try {
      // add guard so route is protected for authenticated users
      await isAuthenticated(req, res);
      await parseFormData(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      const { body, files } = req;
      const data = {
        name: body.name,
        email: body.email,
        about: body.about,
      };

      // validate that all body params are present and formatted
      const { value: validatedData, error: validationError } =
        updateBusinessSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (files.logo) {
        const upload = await uploadFile([files.logo], `businesses/`);
        const uploadedLogo = { url: upload.success[0].Location };
        validatedData.logo = uploadedLogo;
      }

      const updateData = {
        name: validatedData.name,
        email: validatedData.email,
        about: validatedData.about,
        logo: validatedData.logo
          ? {
              create: validatedData.logo,
            }
          : undefined,
      };

      const updatedBusiness = await Business.update(businessId, updateData);
      session!.user = {
        ...session!.user,
        ...{
          businessId: updatedBusiness.id,
          adminOfId: updatedBusiness.id,
          business: updatedBusiness,
          adminOf: updatedBusiness,
        },
      };
      return res.status(200).json(updatedBusiness);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
