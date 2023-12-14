import { GraphQLError } from "graphql";
import jwt, { Secret } from "jsonwebtoken";
import "reflect-metadata";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../../context";
import { hashPassword, verifyPassword } from "../../utils/hash";
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
    const userDB = await ctx.prisma.user.findUnique({
      where: {
        email: userLoginInput.email,
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

    const { email, firstname, lastname, password, user_type_id, id } = userDB;
    const isPasswordValid = verifyPassword({
      password: userLoginInput.password,
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

    const token = jwt.sign(
      {
        userId: id,
        email,
        firstname,
        lastname,
        user_type_id,
      },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );
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
