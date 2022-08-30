import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import isAuthenticated from "helpers/isAuthenticated";
import refreshSessionUser from "helpers/refreshSessionUser";
import Business from "prisma/models/Business";
import User, { UpdateRole } from "prisma/models/User";

export default async function findBusinessBenfits(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);

      // check session user to be the admin of the business
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      // check the employee exists and is a part of the business
      const employeeId = Number(req.query.employeeId);
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).send("Not Found");
      }
      if (employee.businessId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      // check that role was sent
      const role = req.body.role;
      if (!role || !["basic", "verifier", "admin"].includes(role)) {
        return res.status(400).json({
          message: `"role" parameter is required and should be "basic", "verifier" or "admin"`,
        });
      }

      // defaults to basic
      let params: UpdateRole = {
        userId: employeeId,
        canVerify: false,
        adminOf: {
          disconnect: true,
        },
      };

      if (role === "verifier") {
        params = {
          userId: employeeId,
          canVerify: true,
          adminOf: {
            disconnect: true,
          },
        };
      }

      if (role === "admin") {
        params = {
          userId: employeeId,
          canVerify: false,
          adminOf: {
            connect: {
              id: businessId,
            },
          },
        };
      }

      const updated = await User.updateRole(params);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  if (req.method === "DELETE") {
    try {
      await isAuthenticated(req, res);
      await refreshSessionUser(req, res);
      let session = getSession(req, res);

      // check session user to be the admin of the business
      const businessId = Number(req.query.businessId);
      if (session!.user.adminOfId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      // check the employee exists and is a part of the business
      const employeeId = Number(req.query.employeeId);
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).send("Not Found");
      }
      if (employee.businessId !== businessId) {
        return res.status(403).send("Forbidden");
      }

      await Business.removeEmployee(businessId, employeeId);

      return res.status(200).end();
    } catch (error) {
      if ((error as any).code === "E_NOT_FOUND") {
        return res.status(404).send("Not Found");
      }
      if ((error as any).code === "E_NOT_ALLOWED") {
        return res.status(403).send("Forbidden");
      }
      return res.status(500).json({ error });
    }
  }

  return res
    .status(405)
    .json({ message: "Method or endpoint not implemented." });
}
