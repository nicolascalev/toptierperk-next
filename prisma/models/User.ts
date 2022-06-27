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
          company: {
            include: { logo: true }
          },
          adminOf: {
            include: { logo: true }
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
          company: {
            include: { logo: true }
          },
          adminOf: {
            include: { logo: true }
          },
          picture: true,
        },
      });
      return user;
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
          company: true,
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
      const companySelect = {
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
          company: companySelect,
          adminOf: companySelect,
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
  update: async (id: number, data: Prisma.UserUpdateInput) => {
    if (!id) {
      throw new Error("id must be provided to use User.update()");
    }
    try {
      const updatedUser = await prisma.user.update({
        data,
        where: { id },
      });
      return updatedUser;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default User;
