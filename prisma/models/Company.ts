import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

export type CompanyCreateArgs = {
  name: string;
  logo: string | null;
  employees: number[];
  admins: number[];
};

export type CompanyFindPublicSearchParams = {
  searchString?: string;
  skip?: number;
  take?: number;
  orderBy?: "desc" | "asc";
};

const Company = {
  create: async ({
    name,
    logo,
    employees = [],
    admins = [],
  }: CompanyCreateArgs) => {
    if (employees.length == 0 || admins.length == 0) {
      throw new Error("Employees and admins must contain at least one item")
    }
    const connectAdmins = admins.map((adminId) => ({ id: adminId }));
    const connectEmployees = employees.map((employeeId) => ({
      id: employeeId,
    }));
    try {
      const data: Prisma.CompanyCreateInput = {
        name,
        logo,
        employees: {
          connect: connectEmployees,
        },
        admins: {
          connect: connectAdmins,
        },
      };
      const newCompany = await prisma.company.create(<Prisma.CompanyCreateArgs>{
        data,
        include: {
          admins: true,
          employees: true,
        },
      });
      return newCompany;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  find: async ({
    searchString = "",
    skip = undefined,
    take = undefined,
    orderBy = "desc",
  }: CompanyFindPublicSearchParams) => {
    try {
      const companies = await prisma.company.findMany(<Prisma.CompanyFindManyArgs>{
        where: {
          name: { contains: searchString },
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      });
      return companies;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // PATCH: /company/:id
  update: async (id:number, data: Prisma.CompanyUpdateInput) => {
    if (!id) {
      throw new Error("id must be provided to use Company.update()");
    }
    try {
      const updatedCompany = await prisma.company.update(<Prisma.CompanyUpdateArgs>{
        data,
        where: { id },
      });
      return updatedCompany;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Company;
