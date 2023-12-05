import "reflect-metadata";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../context";
import { User } from "./User";

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }

  @Query(() => [User])
  async getUserByEmail(@Ctx() ctx: Context, @Arg("email") email: string) {
    return ctx.prisma.user.findUnique({ where: { email } });
  }
}
