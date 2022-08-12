import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

export type BusinessCreateArgs = {
  name: string;
  email: string;
  about?: string;
  logo: Prisma.PhotoCreateWithoutBusinessInput;
  employees: number[];
  admins: number[];
};

export type BusinessFindPublicSearchParams = {
  searchString?: string;
  skip?: number;
  take?: number;
  orderBy?: "desc" | "asc";
};

const Business = {
  create: async ({
    name,
    email,
    about,
    logo,
    employees = [],
    admins = [],
  }: BusinessCreateArgs) => {
    if (employees.length == 0 || admins.length == 0) {
      throw new Error("Employees and admins must contain at least one item");
    }
    const connectAdmins = admins.map((adminId) => ({ id: adminId }));
    const connectEmployees = employees.map((employeeId) => ({
      id: employeeId,
    }));
    try {
      const data: Prisma.BusinessCreateInput = {
        name,
        email,
        about,
        logo: logo
          ? {
              create: logo,
            }
          : undefined,
        employees: {
          connect: connectEmployees,
        },
        admins: {
          connect: connectAdmins,
        },
      };
      const newBusiness = await prisma.business.create(<Prisma.BusinessCreateArgs>{
        data,
        include: {
          logo: true,
          admins: true,
          employees: true,
        },
      });
      return newBusiness;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  find: async ({
    searchString = "",
    skip = undefined,
    take = undefined,
    orderBy = "desc",
  }: BusinessFindPublicSearchParams) => {
    try {
      const businesses = await prisma.business.findMany(<
        Prisma.BusinessFindManyArgs
      >{
        where: {
          name: { contains: searchString },
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
        include: {
          logo: true,
        },
      });
      return businesses;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  getProfile: async (businessId: number) => {
    try {
      const queryDateTime = new Date();
      const perkInclude = {
        id: true,
        name: true,
        createdAt: true,
        startsAt: false,
        finishesAt: false,
        supplier: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        photos: true,
        categories: {
          select: { id: true, name: true },
        },
      };
      const business =
        await prisma.business.findFirst<Prisma.BusinessFindFirstArgs>({
          where: { id: businessId },
          select: {
            id: true,
            name: true,
            about: true,
            logo: true,
            paidMembership: true,
            claimAmount: true,
            benefitsFrom: {
              where: {
                isActive: true,
                startsAt: {
                  lt: queryDateTime,
                },
                OR: [
                  { finishesAt: null },
                  {
                    finishesAt: {
                      gte: queryDateTime,
                    },
                  },
                ],
              },
              select: perkInclude,
              take: 10,
              orderBy: { createdAt: "desc" },
            },
            benefits: {
              where: { isActive: true },
              select: perkInclude,
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                benefits: true,
                benefitsFrom: true,
              },
            },
          },
        });
      return business;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findOneByName: async (name: string) => {
    try {
      const business = await prisma.business.findUnique(<
        Prisma.BusinessFindUniqueArgs
      >{
        where: {
          name: name,
        },
      });
      return business;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findById: async (id: number) => {
    try {
      const business = await prisma.business.findFirst({
        where: { id },
        include: {
          logo: true,
        },
      });
      return business;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // check with perk id if that perk is available for business or if it has been acquired
  checkAvailableBenefit: async (
    businessId: number,
    benefitId: number
  ): Promise<{ perkIsAvailable: boolean; perkIsAcquired: boolean }> => {
    try {
      const foundAvailablePerk = await prisma.benefit.findFirst({
        where: {
          id: benefitId,
          OR: [
            { isPrivate: false },
            {
              availableFor: {
                some: { id: businessId },
              },
            },
          ],
        },
        select: { id: true },
      });
      const acquiredPerk = await prisma.benefit.findFirst({
        where: {
          id: benefitId,
          beneficiaries: {
            some: { id: businessId },
          },
        },
        select: { id: true },
      });
      const acquireStatus = {
        perkIsAvailable: foundAvailablePerk ? true : false,
        perkIsAcquired: acquiredPerk ? true : false,
      };
      return acquireStatus;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // PATCH: /business/:id
  update: async (id: number, data: Prisma.BusinessUpdateInput) => {
    if (!id) {
      throw new Error("id must be provided to use Business.update()");
    }
    try {
      const updatedBusiness = await prisma.business.update(<
        Prisma.BusinessUpdateArgs
      >{
        data,
        where: { id },
      });
      return updatedBusiness;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  updateSubscription: async (businessId: number, subscriptionId: string) => {
    if (businessId === undefined || subscriptionId === undefined) {
      throw new Error(
        "Business.updateSubscription() required businessId and subscriptionId in the params"
      );
    }

    try {
      const updatedBusiness = await prisma.business.update(<
        Prisma.BusinessUpdateArgs
      >{
        data: { paypalSubscriptionId: subscriptionId, paidMembership: true },
        where: { id: businessId },
        include: {
          logo: true,
          admins: true,
          employees: true,
        },
      });
      return updatedBusiness;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  acquireBenefit: async (businessId: number, benefitId: number) => {
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          benefitsFrom: { connect: { id: benefitId } },
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // removes benefit to offer to employees
  looseBenefit: async (businessId: number, benefitId: number) => {
    try {
      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          benefitsFrom: { disconnect: { id: benefitId } },
        },
      });
      return updated;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Business;
