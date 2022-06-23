import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "../../../helpers/isAuthenticated";
import Company from "../../../prisma/models/Company";
import Joi from "joi";

const createCompanySchema = Joi.object({
  name: Joi.string().required(),
  logo: Joi.string(),
  employees: Joi.array().items(Joi.number().required()),
  admins: Joi.array().items(Joi.number().required()),
});

export default async function companyHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req;

  switch (method) {
    case "GET":
      try {
        const result = await Company.find(query);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(err);
      }
      break;

    case "POST":
      try {
        // add guard so route is protected for authenticated users
        await isAuthenticated(req, res);
        let session = getSession(req, res);

        // get lists and convert them to number array
        const employees = body.employees
          ? body.employees.split(",").map((id: string) => Number(id))
          : [];
        const admins = body.admins
          ? body.admins.split(",").map((id: string) => Number(id))
          : [];

        let data = {
          name: body.name,
          logo: body.logo,
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

        const createdCompany = await Company.create(validatedData);
        // after creating the company make sure that info is stored in session
        // TODO: add to client session too after response
        session!.user = {
          ...session!.user,
          ...{
            companyId: createdCompany.id,
            adminOfId: createdCompany.id,
            company: createdCompany,
            adminOf: createdCompany,
          },
        };
        res.status(200).json(createdCompany);
      } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
      }
      break;
    default:
      res.status(400).json({ message: "Method or endpoint not implemented." });
  }
}
