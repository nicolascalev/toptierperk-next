import prisma from "../prisma.client";
import { Prisma } from "@prisma/client";

type search = {
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
  }: Prisma.UserCreateInput) => {
    try {
      const data = { username, name, email, auth0sub };
      const newUser = await prisma.user.create({ data });
      return newUser;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  upsert: async ({
    username,
    name,
    email,
    auth0sub,
    picture,
  }: Prisma.UserCreateInput) => {
    try {
      const data = { username, name, email, auth0sub, picture };
      const user = await prisma.user.upsert({
        where: { email },
        update: { picture },
        create: data,
        include: {
          company: true,
          adminOf: true,
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
        },
      });
      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  find: async (query: search) => {
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
