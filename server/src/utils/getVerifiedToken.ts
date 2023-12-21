import { Secret, verify } from "jsonwebtoken";
import { Context } from "../context";
import { GraphQLError } from "graphql";
import { createTokens } from "./createTokens";
import { User } from "../resolvers/User";

type Token = {
  userId: string;
};

export const getVerifiedToken = async (context: Context) => {
  const accessToken = context.req.headers.authorization;
  const refreshToken = context.req.headers["set-cookie"];

  if (!accessToken) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  let data;

  try {
    const token = accessToken.replace("Bearer ", "");
    data = verify(token, process.env.JWT_SECRET as Secret) as Token;
    context.req.userId = data.userId;
  } catch (error) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const user = await context.prisma.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user || user === null) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const tokens = createTokens(user as User);

  const tokenExpireDate = new Date();
  tokenExpireDate.setDate(tokenExpireDate.getDate() + 60 * 60 * 24 * 1);

  context.req.headers.authorization = `Bearer ${tokens.accessToken}`;
  context.res?.http?.headers.append(
    "set-cookie",
    `refreshToken=${refreshToken}; expires=${tokenExpireDate}`
  );
  context.req.userId = user.id;

  return data.userId;
};
