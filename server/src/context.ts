import { PrismaClient } from "@prisma/client";
import { IncomingMessage } from "http";

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  req: any;
  res: any;
}

export const context = (req: any) => {
  return {
    ...req,
    prisma,
  };
};
