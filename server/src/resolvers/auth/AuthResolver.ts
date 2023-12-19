import { GraphQLError } from "graphql";
import jwt, { Secret } from "jsonwebtoken";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../../context";
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

    const refreshToken = jwt.sign(
      { userId: userDB.id },
      process.env.JWT_SECRET_REFRESH as Secret,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    const token = jwt.sign(
      { userId: userDB.id },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    ctx.res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    ctx.res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 8600,
    });

    return {
      ...userDB,
      token,
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
