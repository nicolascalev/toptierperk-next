import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "../../../helpers/isAuthenticated";
import Company from "../../../prisma/models/Company";
import Joi from "joi";
import parseFormData from "../../../helpers/parse-form-data";
import uploadFile from "../../../helpers/upload-file";

const createCompanySchema = Joi.object({
  name: Joi.string().required(),
  about: Joi.string(),
  employees: Joi.array().items(Joi.number().required()),
  admins: Joi.array().items(Joi.number().required()),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function companyHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    try {
      const { query } = req;
      const result = await Company.find(query);
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
        // make sure the current user id is on the list
        employees: [...employees, ...[session!.user.id]],
        admins: [...admins, ...[session!.user.id]],
      };
      // validate that all body params are present and formatted
      const { value: validatedData, error: validationError } =
        createCompanySchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (files.logo) {
        const upload = await uploadFile([files.logo], `companies/`);
        const uploadedLogo = { url : upload.success[0].Location }
        validatedData.logo = uploadedLogo;
      }

      const createdCompany = await Company.create(validatedData);
      // after creating the company make sure that info is stored in session
      session!.user = {
        ...session!.user,
        ...{
          companyId: createdCompany.id,
          adminOfId: createdCompany.id,
          company: createdCompany,
          adminOf: createdCompany,
        },
      };
      return res.status(200).json(createdCompany);
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: err });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
