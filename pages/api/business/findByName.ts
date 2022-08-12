import type { NextApiRequest, NextApiResponse } from "next";
import Business from "../../../prisma/models/Business"

export default async function findBusinessByNameHandler(req: NextApiRequest, res: NextApiResponse) {
  const searchString = req.query.searchString as string;
  try {
    const result = await Business.findOneByName(searchString)
    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(400).json(error)
  }
}