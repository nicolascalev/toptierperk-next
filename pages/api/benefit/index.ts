import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Benefit, { BenefitCreateParams } from "../../../prisma/models/Benefit";
import Joi from "joi";
import isAuthenticated from "../../../helpers/isAuthenticated";

const createBenefitSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  categories: Joi.array().items(Joi.string()),
  photos: Joi.array(),
  supplier: Joi.number().integer().required(),
  beneficiaries: Joi.array().items(Joi.number()),
  availableFor: Joi.array().items(Joi.number()),
  isPrivate: Joi.boolean(),
  isActive: Joi.boolean(),
});

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method, body } = req;

  switch (method) {
    case "POST":
      try {
        await isAuthenticated(req, res)
        const session = getSession(req, res)

        const data: BenefitCreateParams = {
          name: body.name,
          description: body.description,
          categories: body.categories ? body.categories.split(",") : [],
          // TODO: upload the pictures first to then pass them and connect them
          photos: [],
          supplier: session!.user.id,
          beneficiaries: body.beneficiaries
            ? body.beneficiaries.split(",").map((id: string) => Number(id))
            : [],
          availableFor: body.availableFor
            ? body.availableFor.split(",").map((id: string) => Number(id))
            : [],
          isPrivate: body.isPrivate,
          isActive: body.isActive,
        };
        const { value: validatedData, error: validationError } =
          createBenefitSchema.validate(data);
        if (validationError) {
          return res.status(400).json({ error: validationError });
        }
        const result = await Benefit.create(validatedData);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json(err);
      }
      break;
    default:
      res.status(400).json({ message: "Method or endpoint not implemented." });
  }
}
