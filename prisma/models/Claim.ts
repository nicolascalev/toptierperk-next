import { Prisma } from "@prisma/client";
import prisma from "prisma/prisma.client";

const Claim = {
  async create(userId: number, benefitId: number, businessId: number) {
    try {
      const claim = await prisma.claim.create<Prisma.ClaimCreateArgs>({
        data: {
          user: {
            connect: { id: userId },
          },
          benefit: {
            connect: { id: benefitId },
          },
          business: {
            connect: { id: businessId },
          },
        },
      });
      return claim;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async findBenefitUserClaims(benefitId: number, userId: number) {
    try {
      const result = await prisma.claim.findMany<Prisma.ClaimFindManyArgs>({
        where: {
          userId,
          benefitId,
        },
      });
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Claim;
