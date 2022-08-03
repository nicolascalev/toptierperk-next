import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Benefit, { BenefitCreateParams } from "prisma/models/Benefit";
import Joi from "joi";
import isAuthenticated from "helpers/isAuthenticated";
import parseFormData from "helpers/parse-form-data";
import uploadFile from "helpers/upload-file";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  useLimit: Joi.number().integer().min(1).allow(null).optional(),
  useLimitPerUser: Joi.number().integer().min(1).allow(null).optional(),
  startsAt: Joi.date().allow(null).optional(),
  finishesAt: Joi.date().allow(null).optional(),
});

type FilesNextApiRequest = NextApiRequest & { files?: any };

export default async function userHandler(
  req: FilesNextApiRequest,
  res: NextApiResponse
) {
  // POST /api/benefit
  if (req.method == "POST") {
    try {
      await isAuthenticated(req, res);
      await parseFormData(req, res);
      const { body, files } = req;
      const session = getSession(req, res);

      if (!session!.user.adminOf) {
        return res.status(401).send("Unauthorized");
      }

      if (!session!.user.adminOf.paidMembership) {
        return res
          .status(404)
          .json({
            error: "You can not create perks without a paid membership.",
          });
      }

      const data: BenefitCreateParams = {
        name: body.name,
        description: body.description,
        categories: body.categories ? body.categories.split(",") : [],
        supplier: session!.user.adminOf.id,
        // TODO: add supllier to beneficiaries, maybe from the frontend
        beneficiaries: body.beneficiaries
          ? body.beneficiaries.split(",").map((id: string) => Number(id))
          : [],
        availableFor: body.availableFor
          ? body.availableFor.split(",").map((id: string) => Number(id))
          : [],
        isPrivate: body.isPrivate,
        isActive: body.isActive,
        useLimit: body.useLimit,
        useLimitPerUser: body.useLimitPerUser,
        startsAt: body.startsAt,
        finishesAt: body.finishesAt,
      };

      data.beneficiaries.push(session!.user.adminOfId);
      data.availableFor!.push(session!.user.adminOfId);

      const { value: validatedData, error: validationError } =
        createBenefitSchema.validate(data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (files.photos) {
        // make sure that photos is always an array even if empty
        const photos = files.photos.length ? files.photos : [files.photos];
        const today = new Date().toLocaleDateString().split("/").join("-");
        const upload = await uploadFile(photos, `benefits/${today}/`);
        const uploadedPhotos = upload.success.map((up) => ({
          url: up.Location,
        }));
        validatedData.photos = uploadedPhotos;
      }

      const result = await Benefit.create(validatedData);
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  res.status(405).json({ error: "Method or endpoint not implemented." });
}
