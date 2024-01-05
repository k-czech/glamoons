import { GraphQLError } from "graphql";
import { Secret, verify } from "jsonwebtoken";
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

    ctx.req.headers.authorization = `Bearer ${accessToken}`;

    return {
      ...userDB,
      token: accessToken,
      refreshToken,
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

  @Mutation(() => UserLoginResponse, {
    name: "generateNewAccessToken",
    description: "Generate new access token",
  })
  async generateNewAccessToken(@Ctx() ctx: Context) {
    const jwtRefreshToken = ctx.req.headers.authorization;

    if (!jwtRefreshToken) {
      throw new GraphQLError("User is not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
          http: { status: 401 },
        },
      });
    }
    const token = jwtRefreshToken.replace("Bearer ", "");
    const data = verify(token, process.env.JWT_SECRET_REFRESH as Secret) as {
      userId: string;
    };

    const user = await ctx.prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    const { accessToken, refreshToken } = createTokens(user as User);

    ctx.req.headers.authorization = `Bearer ${refreshToken}`;

    return {
      ...user,
      token: accessToken,
      refreshToken,
    };
  }
}
