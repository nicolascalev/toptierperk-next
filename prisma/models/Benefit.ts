import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

export type BenefitCreateParams = {
  name: string;
  description: string;
  categories: string[];
  photos?: Prisma.Enumerable<Prisma.PhotoCreateManyBenefitInput>;
  supplier: number;
  beneficiaries: number[];
  startsAt?: Date | string;
  finishesAt?: Date | string | null;
  isPrivate?: boolean;
  availableFor?: number[];
  isActive?: boolean;
  useLimit?: number;
  useLimitPerUser?: number;
};

// TODO: change pagination to use cursor instead of take and skip https://www.prisma.io/docs/concepts/components/prisma-client/pagination
type FindPublicSearchParams = {
  searchString?: string;
  skip?: number;
  take?: number;
  orderBy?: "desc" | "asc";
  categories?: number[];
};

type FindCompanyBenefitParams = {
  searchString?: string;
  beneficiaryId: number;
  isPrivate?: boolean;
  skip?: number;
  take?: number;
  orderBy?: "desc" | "asc";
  categories?: number[];
};

const Benefit = {
  // POST: /benefit
  create: async ({
    name,
    description,
    categories = [],
    photos = [],
    supplier,
    beneficiaries = [],
    startsAt,
    finishesAt,
    isPrivate,
    availableFor = [],
    useLimit,
    useLimitPerUser,
  }: BenefitCreateParams) => {
    const connectOrCreateCategories = categories.map((category) => ({
      where: { name: category },
      create: { name: category },
    }));
    // this should be always empty because when it is created it has not been acquired yet, includes functionality just in case
    const connectBeneficiaries = beneficiaries.map((beneficiary) => ({
      id: beneficiary,
    }));
    // use available for wether it is private or not, in case isPrivate is updated, it already has a list
    const connectAvailableFor = availableFor.map((available) => ({
      id: available,
    }));

    try {
      const data: Prisma.BenefitCreateInput = {
        name,
        description,
        supplier: <Prisma.CompanyCreateNestedOneWithoutBenefitsInput>{
          connect: { id: supplier },
        },
        categories: {
          connectOrCreate: connectOrCreateCategories,
        },
        photos: {
          createMany: {
            data: photos,
          },
        },
        beneficiaries: {
          connect: connectBeneficiaries,
        },
        startsAt,
        finishesAt,
        isPrivate,
        availableFor: {
          connect: connectAvailableFor,
        },
        useLimit,
        useLimitPerUser,
      };
      const newBenefit = await prisma.benefit.create({
        data,
        include: {
          supplier: true,
          categories: true,
          photos: true,
          beneficiaries: true,
          availableFor: true,
        },
      });

      return newBenefit;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // GET: /benefit/:id
  findById: async (id: number) => {
    if (!id) {
      throw new Error("id parameter must be provided");
    }
    try {
      const benefit = await prisma.benefit.findUnique({
        where: { id },
        include: {
          categories: true,
          photos: true,
          supplier: true,
        },
      });
      return benefit;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // TODO: in all searches make sure it filters by isActive=true
  // GET: /benefit
  // Find public benefits wether they have been acquired or not
  findPublicBenefits: async ({
    searchString = "",
    skip = undefined,
    take = undefined,
    orderBy = "desc",
    categories = [],
  }: FindPublicSearchParams) => {
    try {
      const queryDateTime = new Date();

      const filters: Prisma.BenefitFindManyArgs = {
        where: {
          name: { contains: searchString },
          isPrivate: false,
          supplier: {
            paidMembership: true,
          },
          categories: {
            some: {
              id: {
                in: categories,
              },
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
        include: {
          categories: true,
          photos: true,
          supplier: true,
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      };

      if (categories.length <= 0) {
        // delete filters.where.categories;
        filters.where!.categories = {};
      }

      const benefits = await prisma.benefit.findMany(filters);

      return benefits;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // TODO:
  // GET: /allowedbenefits
  // Find ALL benefits a company could see, wether acquired or not, private or not

  // GET: /company/:id/benefits?acquired=true
  // Find acquired benefits wether they are private or not, just show your own
  findAcquiredBenefits: async ({
    searchString = "",
    beneficiaryId,
    skip = undefined,
    take = undefined,
    orderBy = "desc",
    categories = [],
  }: FindCompanyBenefitParams) => {
    try {
      if (!beneficiaryId) {
        throw new Error(
          "beneficiaryId must be provided since you are filtering it's perks"
        );
      }

      const queryDateTime = new Date();

      const filters: Prisma.BenefitFindManyArgs = {
        where: {
          name: { contains: searchString },
          supplier: {
            paidMembership: true,
          },
          categories: {
            some: {
              id: {
                in: categories,
              },
            },
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
        include: {
          categories: true,
          photos: true,
          supplier: true,
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      };

      if (categories.length <= 0) {
        // delete filters.where.categories;
        filters.where!.categories = {};
      }

      const benefits = await prisma.benefit.findMany(filters);

      return benefits;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // GET: /company/:id/benefits?acquired=false
  // Find available benefits only, exclude the ones you already have
  findAvailableBenefits: async ({
    searchString = "",
    beneficiaryId,
    isPrivate = false,
    skip = undefined,
    take = undefined,
    orderBy = "desc",
    categories = [],
  }: FindCompanyBenefitParams) => {
    try {
      if (!beneficiaryId) {
        throw new Error(
          "beneficiaryId must be provided since you are filtering still available perks"
        );
      }

      const queryDateTime = new Date();

      const filters: Prisma.BenefitFindManyArgs = {
        where: {
          name: { contains: searchString },
          isPrivate,
          supplier: {
            paidMembership: true,
          },
          categories: {
            some: {
              id: {
                in: categories,
              },
            },
          },
          beneficiaries: {
            none: {
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
        include: {
          categories: true,
          photos: true,
          supplier: true,
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      };

      if (categories.length <= 0) {
        filters.where!.categories = {};
      }

      if (isPrivate) {
        filters.where!.availableFor = {
          some: {
            id: beneficiaryId,
          },
        };
      }

      const benefits = await prisma.benefit.findMany(filters);

      return benefits;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // GET: /company/:id/benefits
  findAllCompanyBenefits: async ({
    searchString = "",
    beneficiaryId,
    isPrivate = false,
    skip = undefined,
    take = undefined,
    orderBy = "desc",
    categories = [],
  }: FindCompanyBenefitParams) => {
    try {
      if (!beneficiaryId) {
        throw new Error(
          "beneficiaryId must be provided since you are filtering perks trying to figure out the ones the beneficiary has or not at the same time"
        );
      }

      const queryDateTime = new Date();

      const filters: Prisma.BenefitFindManyArgs = {
        where: {
          name: { contains: searchString },
          isPrivate,
          supplier: {
            paidMembership: true,
          },
          categories: {
            some: {
              id: {
                in: categories,
              },
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
        include: {
          categories: true,
          photos: true,
          supplier: true,
          beneficiaries: {
            where: { id: beneficiaryId },
          },
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      };

      if (categories.length <= 0) {
        filters.where!.categories = {};
      }

      if (isPrivate) {
        filters.where!.availableFor = {
          some: {
            id: beneficiaryId,
          },
        };
      }

      const benefits = await prisma.benefit.findMany(filters);

      return benefits;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Benefit;
