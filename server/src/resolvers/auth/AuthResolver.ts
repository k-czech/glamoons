import { GraphQLError } from "graphql";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../../context";
import { createTokens } from "../../utils/createTokens";
import { getUserFromDB } from "../../utils/getUserFromDB";
import { hashPassword } from "../../utils/hash";
import {
  User,
  UserCreateInput,
  UserLoginInput,
  UserLoginResponse,
} from "../User";

@Resolver(User)
export class AuthResolver {
  constructor() {}
  @Mutation(() => UserLoginResponse, {
    name: "loginUser",
    description: "Login user",
  })
  async loginUser(
    @Arg("userLoginInput") userLoginInput: UserLoginInput,
    @Ctx() ctx: Context
  ) {
    const { userDB } = await getUserFromDB(ctx, userLoginInput);

    const { accessToken, refreshToken } = createTokens(userDB as User);

    const tokenExpireDate = new Date();
    tokenExpireDate.setDate(tokenExpireDate.getDate() + 60 * 60 * 24 * 1);

    ctx.req.headers.authorization = `Bearer ${accessToken}`;
    ctx.res?.http?.headers.append(
      "set-cookie",
      `refreshToken=${refreshToken}; expires=${tokenExpireDate}`
    );

    return {
      ...userDB,
      token: accessToken,
    };
  }

  @Mutation(() => User, {
    name: "createUser",
    description: "Create a new user",
  })
  async createUser(
    @Arg("createUserInput") createUserInput: UserCreateInput,
    @Ctx() ctx: Context
  ) {
    const { password, ...rest } = createUserInput;
    const { hash } = await hashPassword(password);

    const userExist = await ctx.prisma.user.findUnique({
      where: {
        email: createUserInput.email,
      },
    });

    if (userExist !== null) {
      throw new GraphQLError(
        "User with this email address already exists in the system",
        {
          extensions: {
            code: "USER_EXIST",
            http: { status: 409 },
          },
        }
      );
    }

    const user = await ctx.prisma.user.create({
      data: {
        ...rest,
        password: hash,
        type: {
          connect: {
            id: 2,
          },
        },
      },
    });

    return user;
  }
}
