import { GraphQLError } from "graphql";
import "reflect-metadata";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../context";
import { User, UserUpdateInput } from "../User";
import { verifyToken } from "../../utils/verifyToken";
import { IncomingMessage } from "http";

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }

  @Query(() => User)
  async getUserByEmail(@Arg("email") email: string, @Ctx() ctx: Context) {
    const user = await ctx.prisma.user.findUnique({ where: { email } });

    if (user === null) {
      throw new GraphQLError(
        "User with this email address not found in the system",
        {
          extensions: {
            code: "USER_NOT_FOUND",
            http: { status: 400 },
          },
        }
      );
    }

    return user;
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("userUpdateInput") userUpdateInput: UserUpdateInput,
    @Ctx() ctx: Context
  ) {
    const { id, ...rest } = userUpdateInput;
    return await ctx.prisma.user.update({
      where: { id },
      data: {
        ...rest,
      },
    });
  }
}
