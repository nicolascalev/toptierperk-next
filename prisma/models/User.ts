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
    auth0sub,
    picture,
  }: Prisma.UserCreateInput) => {
    try {
      const newUser = await prisma.user.create({
        data: {
          username,
          name,
          email,
          auth0sub,
          picture: {
            create: <Prisma.PhotoCreateWithoutUserInput>picture,
          },
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
      })
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
};

export default User;
