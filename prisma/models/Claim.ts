import {
  Prisma,
  Claim as ClaimType,
  Benefit,
  Business,
  User,
} from "@prisma/client";
import prisma from "prisma/prisma.client";

type ClaimWithRelations = ClaimType & {
  benefit?: Benefit;
  user?: User;
  supplier?: Business;
  business?: Business;
};

const Claim = {
  async create(
    userId: number,
    benefitId: number,
    businessId: number,
    supplierId: number
  ) {
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

  async findById(claimId: number): Promise<ClaimWithRelations | null> {
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

  async approve(claimId: number, approvedAt: Date) {
    try {
      // update claim and set approvedAt
      const updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: { approvedAt },
      });
      // increase benefit claimAmount
      await prisma.business.update({
        where: { id: updatedClaim.supplierId },
        data: {
          claimAmount: { increment: 1 },
        },
      });
      // increase supplier claimAmount
      await prisma.benefit.update({
        where: { id: updatedClaim.benefitId },
        data: {
          claimAmount: { increment: 1 },
        },
      });
      return updatedClaim;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async delete(claimId: number) {
    try {
      const deleted = await prisma.claim.delete({
        where: { id: claimId },
      });
      return deleted;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Claim;
