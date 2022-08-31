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
  cursor?: number;
};

type BusinessPublicOfferParams = {
  supplierId: number;
  skip?: number;
  cursor?: number;
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
      const newBusiness = await prisma.business.create(<
        Prisma.BusinessCreateArgs
      >{
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
    cursor = undefined,
  }: BusinessFindPublicSearchParams) => {
    try {
      const businesses = await prisma.business.findMany(<
        Prisma.BusinessFindManyArgs
      >{
        where: {
          name: { contains: searchString },
        },
        take: 10,
        skip: skip,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
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

  findEmployees: async ({
    businessId,
    searchString = "",
    skip = undefined,
    cursor = undefined,
  }: BusinessFindPublicSearchParams & { businessId: number }) => {
    try {
      const employees = await prisma.user.findMany({
        where: {
          businessId,
          OR: [
            {
              email: {
                contains: searchString,
              },
            },
            {
              name: {
                contains: searchString,
              },
            },
          ],
        },
        take: 10,
        skip: skip,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
      });
      return employees;
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

  findPublicOffers: async ({
    supplierId,
    skip,
    cursor,
  }: BusinessPublicOfferParams) => {
    try {
      const queryDateTime = new Date();

      const offers = await prisma.benefit.findMany<Prisma.BenefitFindManyArgs>({
        where: {
          isActive: true,
          supplier: {
            id: supplierId,
            paidMembership: true,
          },
          startsAt: {
            // where it started before now
            lt: queryDateTime,
          },
          // where it hasn't finished or there isn't finish date
          OR: [
            { finishesAt: null },
            {
              finishesAt: {
                gte: queryDateTime,
              },
            },
          ],
        },
        take: 10,
        skip,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        include: {
          categories: true,
          photos: true,
          supplier: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return offers;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // find acquired perks of a business provided by a specific supplier
  findBenefitsFromSupplier: async ({
    beneficiaryId,
    supplierId,
    skip,
    cursor,
  }: BusinessPublicOfferParams & { beneficiaryId: number }) => {
    try {
      const queryDateTime = new Date();

      const offers = await prisma.benefit.findMany<Prisma.BenefitFindManyArgs>({
        where: {
          isActive: true,
          supplier: {
            id: supplierId,
            paidMembership: true,
          },
          beneficiaries: {
            some: {
              id: beneficiaryId,
            },
          },
          startsAt: {
            // where it started before now
            lt: queryDateTime,
          },
          // where it hasn't finished or there isn't finish date
          OR: [
            { finishesAt: null },
            {
              finishesAt: {
                gte: queryDateTime,
              },
            },
          ],
        },
        take: 10,
        skip,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        include: {
          categories: true,
          photos: true,
          supplier: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return offers;
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

  updateAllowedEmails: async (
    businessId: number,
    allowedEmailsJson: Prisma.InputJsonValue
  ) => {
    try {
      const updated = await prisma.business.update<Prisma.BusinessUpdateArgs>({
        where: { id: businessId },
        data: {
          allowedEmployeeEmails: allowedEmailsJson,
        },
      });
      return updated;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  removeEmployee: async (businessId: number, employeeId: number) => {
    try {
      const employee = await prisma.user.findFirst({
        where: { id: employeeId },
      });
      if (!employee) {
        return Promise.reject({
          code: "E_NOT_FOUND",
          error: "Employee with that id not found",
        });
      }
      if (employee.businessId !== businessId) {
        return Promise.reject({
          code: "E_NOT_ALLOWED",
          error: "Employee does not belong to your business",
        });
      }

      await prisma.user.update({
        where: { id: employeeId },
        data: {
          business: {
            disconnect: true,
          },
          adminOf: {
            disconnect: true,
          },
          canVerify: false,
          authorizationChanged: true,
        },
      });
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Business;
