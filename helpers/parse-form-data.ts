import type { NextApiRequest, NextApiResponse } from "next";
import runMiddleware from "./run-middleware";
import formidable from "formidable"

type FilesNextApiRequest = NextApiRequest & { files?: formidable.Files }

async function parse(req: FilesNextApiRequest, res: NextApiResponse, next: any) {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    req.body = fields;
    req.files = files;
    next()
  });
}

export default async function parseFormData(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, parse)
  } catch (err) {
    return res.status(500).json({ error: err })
  }
}