import { GraphQLError } from "graphql";
import "reflect-metadata";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../context";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { User, UserUpdateInput } from "../User";

@Resolver(User)
export class UserResolver {
  constructor() {}
  @Query(() => [User], {
    name: "allUsers",
    description: "Get all users from the system",
  })
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }

  @Query(() => User, {
    name: "getUserByEmail",
    description: "Get user by email",
  })
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

  @Authorized()
  @Mutation(() => User, {
    name: "updateUser",
    description: "Update user by specific id",
  })
  async updateUser(
    @Arg("userUpdateInput") userUpdateInput: UserUpdateInput,
    @Ctx() ctx: Context
  ) {
    const userDB = await ctx.prisma.user.findUnique({
      where: {
        id: userUpdateInput.id,
      },
    });

    if (userDB === null) {
      throw new GraphQLError("User not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          http: { status: 400 },
        },
      });
    }

    if (userUpdateInput.currentPassword) {
      const { password: userDBPassword } = userDB;
      const isPasswordValid = verifyPassword({
        password: userUpdateInput.currentPassword,
        hash: userDBPassword,
      });

      if (!isPasswordValid) {
        throw new GraphQLError("The current password is not valid", {
          extensions: {
            code: "PASSWORD_NOT_VALID",
            http: { status: 400 },
          },
        });
      }
    }

    const { id, firstname, lastname, password, phone } = userUpdateInput;
    let data: typeof userUpdateInput = {
      id: "",
      firstname: "",
      lastname: "",
      phone: undefined,
      currentPassword: "",
      password: "",
    };

    if (password) {
      const { hash } = await hashPassword(password);
      data = {
        id,
        firstname,
        lastname,
        password: hash,
        phone,
      };
    } else {
      data = {
        id,
        firstname,
        lastname,
        phone,
      };
    }

    return await ctx.prisma.user.update({
      where: { id },
      data,
    });
  }
}
