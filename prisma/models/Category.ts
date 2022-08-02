import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

type FindOrCreateReturn = { id: number }[];
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
          createdAt: 'desc',
        }
      });
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Category;
