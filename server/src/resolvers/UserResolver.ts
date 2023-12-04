import "reflect-metadata";
import { Query, Resolver, Ctx } from "type-graphql";
import { User } from "./User";
import { Context } from "../context";

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }
}
