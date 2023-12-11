import { Matches, MinLength } from "class-validator";
import { GraphQLError } from "graphql";
import jwt, { Secret } from "jsonwebtoken";
import "reflect-metadata";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { Context } from "../../context";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { User, UserLoginResponse } from "../User";

@InputType()
class UserCreateInput {
  @Field(() => String)
  firstname: User["firstname"];

  @Field(() => String)
  lastname: User["lastname"];

  @Field(() => String)
  email: User["email"];

  @Field(() => String!)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, {
    message:
      "Password must contain at least one letter, one number and one special character",
  })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  password: string;
}

@InputType()
class UserLoginInput {
  @Field(() => String)
  email: User["email"];

  @Field(() => String!)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, {
    message:
      "Password must contain at least one letter, one number and one special character",
  })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  password: string;
}

@Resolver(User)
export class AuthResolver {
  @Mutation(() => UserLoginResponse)
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

    const { email, firstname, lastname, password, userTypeId } = userDB;
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
        email,
        firstname,
        lastname,
        userTypeId,
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

  @Mutation(() => User)
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
