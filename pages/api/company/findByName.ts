import type { NextApiRequest, NextApiResponse } from "next";
import Company from "../../../prisma/models/Company"

export default async function findCompanyByNameHandler(req: NextApiRequest, res: NextApiResponse) {
  const searchString = req.query.searchString as string;
  try {
    const result = await Company.findOneByName(searchString)
    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(400).json(error)
  }
}