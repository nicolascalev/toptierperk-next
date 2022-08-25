import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

export type UserSearchParams = {
  searchString?: string;
  skip?: number;
  take?: number;
  orderBy: "desc" | "asc";
};

const User = {
  create: async ({
    username,
    name,
    email,
    emailVerified,
    auth0sub,
    picture,
  }: Prisma.UserCreateInput) => {
    try {
      const newUser = await prisma.user.create({
        data: {
          username,
          name,
          email,
          emailVerified,
          auth0sub,
        },
        include: {
          business: {
            include: { logo: true },
          },
          adminOf: {
            include: { logo: true },
          },
          picture: true,
        },
      });
      return newUser;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findByAuth0Sub: async (sub: string) => {
    if (!sub) {
      throw new Error(
        "at least one parameter is required and it should be an auth0 sub"
      );
    }
    try {
      const user = await prisma.user.findUnique(<Prisma.UserFindUniqueArgs>{
        where: { auth0sub: sub },
        include: {
          business: {
            include: { logo: true },
          },
          adminOf: {
            include: { logo: true },
          },
          picture: true,
        },
      });
      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findByUsername: async (username: string) => {
    try {
      const result = await prisma.user.findFirst({
        where: { username },
        select: { id: true },
      });
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findById: async (id: number) => {
    if (!id) {
      throw new Error("id parameter must be provided");
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          business: true,
          adminOf: true,
          picture: true,
        },
      });
      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  find: async (query: UserSearchParams) => {
    try {
      const {
        searchString = "",
        skip = undefined,
        take = undefined,
        orderBy = "desc",
      } = query;
      const businessSelect = {
        select: {
          id: true,
          createdAt: true,
          name: true,
          logo: true,
        },
      };
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchString } },
            { username: { contains: searchString } },
          ],
        },
        select: {
          id: true,
          createdAt: true,
          username: true,
          email: true,
          name: true,
          picture: true,
          business: businessSelect,
          adminOf: businessSelect,
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
          createdAt: orderBy,
        },
      });

      return users;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // PATCH: /user/:id
  update: async (
    id: number,
    {
      name,
      username,
      picture,
    }: { name: string; username: string; picture?: { url: string } }
  ) => {
    if (!id) {
      throw new Error("id must be provided to use User.update()");
    }
    try {
      const updatedUser = await prisma.user.update<Prisma.UserUpdateArgs>({
        data: {
          name,
          username,
          picture: picture
            ? {
                create: picture,
              }
            : undefined,
        },
        where: { id },
        include: {
          business: {
            include: { logo: true },
          },
          adminOf: {
            include: { logo: true },
          },
          picture: true,
        },
      });
      return updatedUser;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  setVerifiedEmail: async (userId: number, verified: boolean) => {
    try {
      const updated = await prisma.user.update<Prisma.UserUpdateArgs>({
        where: { id: userId },
        data: { emailVerified: verified },
        include: {
          business: {
            include: { logo: true },
          },
          adminOf: {
            include: { logo: true },
          },
          picture: true,
        },
      });
      return updated;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  // TODO find a way to sort them in the order the user saved them
  findSavedPerks: async (
    userId: number,
    skip: number,
    cursor: number | undefined
  ) => {
    try {
      const saved = await prisma.benefit.findMany({
        where: {
          savedBy: {
            some: { id: userId },
          },
        },
        take: 10,
        skip: skip,
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
      });
      return saved;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  checkSavedPerk: async (userId: number, perkId: number) => {
    try {
      const check = await prisma.user.findFirst({
        where: {
          id: userId,
          savedBenefits: { some: { id: perkId } },
        },
      });
      return check;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  savePerk: async (userId: number, perkId: number) => {
    try {
      const saved = await prisma.user.update<Prisma.UserUpdateArgs>({
        where: { id: userId },
        data: {
          savedBenefits: { connect: { id: perkId } },
        },
      });
      return saved;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  deleteSavedPerk: async (userId: number, perkId: number) => {
    try {
      const removed = await prisma.user.update<Prisma.UserUpdateArgs>({
        where: { id: userId },
        data: {
          savedBenefits: { disconnect: { id: perkId } },
        },
      });
      return removed;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findClaims: async (
    userId: number,
    skip: number,
    cursor: number | undefined
  ) => {
    try {
      const userClaims = await prisma.claim.findMany<Prisma.ClaimFindManyArgs>({
        where: { userId },
        skip,
        take: 10,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        include: {
          user: { include: { picture: true } },
          benefit: {
            include: {
              photos: true,
              supplier: { include: { logo: true } },
              categories: true,
            },
          },
          business: { include: { logo: true } },
          supplier: { include: { logo: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return userClaims;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default User;
