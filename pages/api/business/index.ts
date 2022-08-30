import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import Business from "prisma/models/Business";
import Joi from "joi";
import parseFormData from "helpers/parse-form-data";
import uploadFile from "helpers/upload-file";

const createBusinessSchema = Joi.object({
  name: Joi.string().required().max(30),
  about: Joi.string().required().max(500),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  employees: Joi.array().items(Joi.number().required()),
  admins: Joi.array().items(Joi.number().required()),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function businessHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    try {
      const searchString = req.query.searchString as string || "";
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
      const result = await Business.find({ searchString, skip, cursor });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  if (req.method == "POST") {
    try {
      // add guard so route is protected for authenticated users
      await isAuthenticated(req, res);
      await parseFormData(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);
      const { body, files } = req;

      // get lists and convert them to number array
      const employees = body.employees
        ? body.employees.split(",").map((id: string) => Number(id))
        : [];
      const admins = body.admins
        ? body.admins.split(",").map((id: string) => Number(id))
        : [];

      let data = {
        name: body.name,
        about: body.about,
        email: body.email,
        // make sure the current user id is on the list
        employees: [...employees, ...[session!.user.id]],
        admins: [...admins, ...[session!.user.id]],
      };
      // validate that all body params are present and formatted
      const { value: validatedData, error: validationError } =
        createBusinessSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (files.logo) {
        const upload = await uploadFile([files.logo], `businesses/`);
        const uploadedLogo = { url : upload.success[0].Location }
        validatedData.logo = uploadedLogo;
      }

      const createdBusiness = await Business.create(validatedData);
      // after creating the business make sure that info is stored in session
      session!.user = {
        ...session!.user,
        ...{
          businessId: createdBusiness.id,
          adminOfId: createdBusiness.id,
          business: createdBusiness,
          adminOf: createdBusiness,
        },
      };
      return res.status(200).json(createdBusiness);
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
