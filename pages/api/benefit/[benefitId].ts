import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Benefit from "prisma/models/Benefit";
import Category from "prisma/models/Category";
import Joi from "joi";
import isAuthenticated from "helpers/isAuthenticated";
import parseFormData from "helpers/parse-form-data";
import refreshSessionUser from "helpers/refreshSessionUser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const updateBenefitSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  categories: Joi.array().items(Joi.number()).optional(),
  beneficiaries: Joi.array().items(Joi.number()).optional(),
  availableFor: Joi.array().items(Joi.number()).optional(),
  isPrivate: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  useLimit: Joi.number().integer().min(1).allow(null).optional(),
  useLimitPerUser: Joi.number().integer().min(1).allow(null).optional(),
  startsAt: Joi.date().allow(null).optional(),
  finishesAt: Joi.date().allow(null).optional(),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export default async function singleBenefitHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  // GET /api/benefit/[id]
  if (req.method === "GET") {
    try {
      const benefitId = Number(req.query.benefitId);
      const perk = await Benefit.findById(benefitId);
      if (!perk) {
        return res
          .status(404)
          .json({ error: `Perk with the id ${benefitId} was not found.` });
      }
      return res.status(200).json(perk);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
  // PATCH /api/benefit/[id]
  // TODO: implement photos update
  if (req.method == "PATCH") {
    try {
      await isAuthenticated(req, res);
      await parseFormData(req, res);
      const { body, query } = req;
      await refreshSessionUser(req, res);
      const session = getSession(req, res);
      if (!session!.user.adminOf) {
        return res.status(401).send("Unauthorized");
      }
      const perkId = Number(query.benefitId);
      const perk = await Benefit.findById(perkId);
      if (!perk) {
        return res
          .status(404)
          .json({ error: `Perk with the id ${perkId} was not found` });
      }
      if (perk.supplier.id !== session!.user.adminOfId) {
        return res.status(403).send("Forbidden");
      }

      const categories = body.categories
        ? await Category.findOrCreate(body.categories)
        : undefined;
      const beneficiaries: number[] | undefined = body.beneficiaries
        ? body.beneficiaries.split(",").map((id: string) => Number(id))
        : undefined;
      const availableFor: number[] | undefined = body.availableFor
        ? body.availableFor.split(",").map((id: string) => Number(id))
        : undefined;

      const data: any = {};
      data.name = body.name;
      data.description = body.description;
      data.categories = categories
        ? categories.map((cat) => cat.id)
        : undefined;
      data.beneficiaries = beneficiaries;
      data.availableFor = availableFor;
      data.isPrivate = body.isPrivate;
      data.isActive = body.isActive;
      data.useLimit = body.useLimit || undefined;
      data.useLimitPerUser = body.useLimitPerUser || undefined;
      data.startsAt = body.startsAt || null;
      data.finishesAt = body.finishesAt || null;

      const { value: validatedData, error: validationError } =
        updateBenefitSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const result = await Benefit.update(perkId, validatedData);
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
