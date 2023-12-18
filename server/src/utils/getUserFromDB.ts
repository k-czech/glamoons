import { UserLoginInput } from "src/resolvers/User";
import { Context } from "../context";
import { GraphQLError } from "graphql";
import { verifyPassword } from "./hash";

export const getUserFromDB = async (ctx: Context, user: UserLoginInput) => {
  const userDB = await ctx.prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (userDB === null) {
    throw new GraphQLError("Email or password is incorrect", {
      extensions: {
        code: "USER_NOT_FOUND",
        http: { status: 400 },
      },
    });
  }

  const { password } = userDB;
  const isPasswordValid = verifyPassword({
    password: user.password,
    hash: password,
  });

  if (!isPasswordValid) {
    throw new GraphQLError("Email or password is incorrect", {
      extensions: {
        code: "PASSWORD_NOT_VALID",
        http: { status: 400 },
      },
    });
  }

  return {
    userDB,
  };
};
