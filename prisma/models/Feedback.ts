import prisma from "prisma/prisma.client";
import { Prisma } from "@prisma/client";

export type FeedbackCreate = {
  benefit?: number;
  claim?: number;
  reporter: number;
  feedback: string;
  type: string;
  location: string;
  mood: number;
};

const Feedback = {
  async create({
    benefit,
    claim,
    reporter,
    feedback,
    type,
    location,
    mood,
  }: FeedbackCreate) {
    try {
      const created = await prisma.feedback.create<Prisma.FeedbackCreateArgs>({
        data: {
          feedback,
          type,
          location,
          mood,
          reporter: {
            connect: { id: reporter },
          },
          benefit: benefit
            ? {
                connect: { id: benefit },
              }
            : undefined,
          claim: claim
            ? {
                connect: { id: claim },
              }
            : undefined,
        },
      });
      return created;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default Feedback;
