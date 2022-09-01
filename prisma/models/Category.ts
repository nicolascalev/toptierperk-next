import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

type FindOrCreateReturn = { id: number }[];

type CategoryPublicOffersParams = {
  category: number;
  skip?: number;
  cursor?: number;
};

const Category = {
  async findOrCreate(list: string): Promise<FindOrCreateReturn> {
    const categories = [];
    try {
      const parsedList: string[] = list.split(",");
      for (const item of parsedList) {
        const foundItem =
          await prisma.category.upsert<Prisma.CategoryUpsertArgs>({
            where: { name: item },
            update: { name: item },
            create: { name: item },
          });
        categories.push(foundItem);
      }
    } catch (err) {
      return Promise.reject(err);
    }
    return categories;
  },

  async find({ searchString = "" }: { searchString: string }) {
    try {
      const result = await prisma.category.findMany({
        where: {
          name: {
            contains: searchString,
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async findById(id: number) {
    try {
      const category = await prisma.category.findFirst({
        where: { id },
      });
      return category;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findPublicOffers: async ({
    category,
    skip,
    cursor,
  }: CategoryPublicOffersParams) => {
    try {
      const queryDateTime = new Date();

      const offers = await prisma.benefit.findMany<Prisma.BenefitFindManyArgs>({
        where: {
          isActive: true,
          isPrivate: false,
          supplier: {
            paidMembership: true,
          },
          categories: {
            some: { id: category },
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

  findCategoryBusinessPerks: async ({
    business,
    category,
    skip,
    cursor,
  }: CategoryPublicOffersParams & { business: number }) => {
    try {
      const queryDateTime = new Date();

      const offers = await prisma.benefit.findMany<Prisma.BenefitFindManyArgs>({
        where: {
          isActive: true,
          supplier: {
            paidMembership: true,
          },
          beneficiaries: {
            some: { id: business },
          },
          categories: {
            some: { id: category },
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
};

export default Category;
