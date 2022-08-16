import { Prisma } from "@prisma/client";
import prisma from "prisma/prisma.client";

const Claim = {
  async create(userId: number, benefitId: number, businessId: number, supplierId: number) {
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
          supplier: {
            connect: { id: supplierId },
          },
        },
      });
      return claim;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async findById(claimId: number) {
    try {
      const claim = await prisma.claim.findFirst<Prisma.ClaimFindFirstArgs>({
        where: {
          id: claimId,
        },
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
